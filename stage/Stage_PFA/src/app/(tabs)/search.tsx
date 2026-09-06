import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, SearchDataType } from '@/services/dataService';
import { ASSETS } from '@/assets';
import { useDebounce, useOfflineCatalog } from '@/hooks';
import {
  useSearchStore,
  useFilterStore,
  useCatalogCacheStore,
  buildCatalogCacheKey,
  useNetworkStore,
} from '@/store';
import {
  PredictiveSearchDropdown,
  CatalogFilterModal,
  Skeleton,
  ProductCardSkeleton,
  RestaurantCardSkeleton,
  EmptyState,
  LoadingState,
  ErrorState,
} from '@/components';


const PAGE_SIZE = 4;

function parseDistanceInKm(distanceStr?: string): number {
  if (!distanceStr) return 0;
  const lower = distanceStr.toLowerCase().trim();
  if (lower.includes('m') && !lower.includes('km')) {
    const val = parseFloat(lower.replace('m', ''));
    return isNaN(val) ? 0 : val / 1000;
  }
  const val = parseFloat(lower.replace('km', ''));
  return isNaN(val) ? 0 : val;
}

function parseDeliveryTimeInMin(timeStr?: string): number {
  if (!timeStr) return 0;
  const numbers = timeStr.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 0;
  const parsed = numbers.map((n) => parseInt(n, 10));
  return Math.max(...parsed);
}

/**
 * Pixel-Perfect Search & Catalog Screen matching Jiblina design system.
 * Features:
 * - Live predictive search (300ms debounce)
 * - Persistent search history (Zustand + AsyncStorage)
 * - Persistent catalog filters (price, distance, rating, delivery time)
 * - Filter modal with active count badge and reset button
 * - Infinite scroll pagination with local Zustand caching (5-minute TTL per active filter)
 * - Pull-to-refresh cache invalidation
 */
export default function SearchTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Offline-first catalog loading: cache → server → auto-refresh on reconnection
  const {
    data: searchData,
    loading: initialLoading,
    isOfflineData,
    lastCachedAt,
    refresh: refreshCatalog,
  } = useOfflineCatalog<SearchDataType>(
    () => dataService.getSearchData(),
    'jiblina-offline-catalog'
  );

  const isConnected = useNetworkStore((s) => s.isConnected);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

  // Debounced query for predictive dropdown & cache key calculation
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Zustand persistent stores
  const { addSearch } = useSearchStore();
  const { filters, resetFilters, getActiveFiltersCount } = useFilterStore();
  const activeFiltersCount = getActiveFiltersCount();

  // Zustand catalog cache store with 5 min TTL
  const { getValidCacheEntry, setCachePage, invalidateCacheKey } = useCatalogCacheStore();

  // State for paginated items
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Deterministic cache key based on active query & filters
  const currentCacheKey = useMemo(() => {
    return buildCatalogCacheKey(selectedCategory, debouncedQuery, filters);
  }, [selectedCategory, debouncedQuery, filters]);

  // Filter full raw list based on active category, search query, and catalog filters
  const getFilteredFullList = useCallback(() => {
    if (!searchData) return [];
    return searchData.results.filter((item) => {
      // 1. Category Filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // 2. Search Query Filter
      const q = debouncedQuery.trim().toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCuisine = (item as any).cuisine?.toLowerCase().includes(q);
      const matchesResto = (item as any).restaurantName?.toLowerCase().includes(q);
      const matchesDesc = (item as any).description?.toLowerCase().includes(q);
      const matchesQuery = !q || matchesName || matchesCuisine || matchesResto || matchesDesc;

      if (!matchesCategory || !matchesQuery) return false;

      // 3. Price Level Filter
      if (filters.priceLevel) {
        if (item.type === 'restaurant') {
          if ((item as any).priceLevel !== filters.priceLevel) return false;
        } else if (item.type === 'food') {
          const price = (item as any).price || 0;
          if (filters.priceLevel === '$' && price > 60) return false;
          if (filters.priceLevel === '$$' && (price <= 60 || price > 90)) return false;
          if (filters.priceLevel === '$$$' && price <= 90) return false;
        }
      }

      // 4. Distance Filter
      if (filters.maxDistance !== null) {
        const dist = parseDistanceInKm((item as any).distance);
        if (dist > 0 && dist > filters.maxDistance) return false;
      }

      // 5. Min Rating Filter
      if (filters.minRating !== null) {
        const rating = (item as any).rating || 0;
        if (rating < filters.minRating) return false;
      }

      // 6. Max Delivery Time Filter
      if (filters.maxDeliveryTime !== null) {
        const deliveryMin = parseDeliveryTimeInMin((item as any).deliveryTime);
        if (deliveryMin > 0 && deliveryMin > filters.maxDeliveryTime) return false;
      }

      return true;
    });
  }, [searchData, selectedCategory, debouncedQuery, filters]);

  // Load items from 5-minute TTL cache or fetch page 1
  useEffect(() => {
    if (!searchData) return;

    // Check if valid cache entry exists (TTL < 5 min)
    const validEntry = getValidCacheEntry(currentCacheKey);

    if (validEntry) {
      // Reconstruct list from all cached pages up to currentPage
      const allCachedItems: any[] = [];
      for (let p = 1; p <= validEntry.currentPage; p++) {
        if (validEntry.pages[p]) {
          allCachedItems.push(...validEntry.pages[p]);
        }
      }
      setDisplayedItems(allCachedItems);
      setCurrentPage(validEntry.currentPage);
      setHasMore(validEntry.hasMore);
    } else {
      // Cache miss or TTL expired -> fetch page 1 fresh
      const fullList = getFilteredFullList();
      const page1Items = fullList.slice(0, PAGE_SIZE);
      const more = fullList.length > PAGE_SIZE;

      setDisplayedItems(page1Items);
      setCurrentPage(1);
      setHasMore(more);

      // Save page 1 in Zustand cache
      setCachePage(currentCacheKey, 1, page1Items, more, fullList.length);
    }
  }, [currentCacheKey, searchData, getFilteredFullList, getValidCacheEntry, setCachePage]);

  // Infinite Scroll: Load Next Page
  const loadNextPage = () => {
    if (loadingMore || !hasMore || !searchData) return;

    const nextPage = currentPage + 1;
    const validEntry = getValidCacheEntry(currentCacheKey);

    // If next page is already cached in Zustand store
    if (validEntry && validEntry.pages[nextPage]) {
      const cachedItems = validEntry.pages[nextPage];
      setDisplayedItems((prev) => [...prev, ...cachedItems]);
      setCurrentPage(nextPage);
      setHasMore(validEntry.hasMore);
      return;
    }

    // Load next page with subtle async simulation
    setLoadingMore(true);
    setTimeout(() => {
      const fullList = getFilteredFullList();
      const startIndex = (nextPage - 1) * PAGE_SIZE;
      const endIndex = nextPage * PAGE_SIZE;
      const nextPageItems = fullList.slice(startIndex, endIndex);
      const more = endIndex < fullList.length;

      setDisplayedItems((prev) => [...prev, ...nextPageItems]);
      setCurrentPage(nextPage);
      setHasMore(more);

      // Cache new page in Zustand store
      setCachePage(currentCacheKey, nextPage, nextPageItems, more, fullList.length);
      setLoadingMore(false);
    }, 300);
  };

  // Pull to Refresh: Invalidate active cache key and reload page 1
  const handleRefresh = async () => {
    setRefreshing(true);
    // Invalidate active cache key in Zustand store
    invalidateCacheKey(currentCacheKey);

    // Refresh catalog from server (or serve cached if offline)
    await refreshCatalog();

    const fullList = getFilteredFullList();
    const page1Items = fullList.slice(0, PAGE_SIZE);
    const more = fullList.length > PAGE_SIZE;

    setDisplayedItems(page1Items);
    setCurrentPage(1);
    setHasMore(more);

    // Cache fresh page 1
    setCachePage(currentCacheKey, 1, page1Items, more, fullList.length);
    setRefreshing(false);
  };


  const handleSelectSuggestion = (term: string) => {
    setSearchQuery(term);
    addSearch(term);
    setIsDropdownVisible(false);
    Keyboard.dismiss();
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addSearch(searchQuery);
    }
    setIsDropdownVisible(false);
    Keyboard.dismiss();
  };

  const getItemImage = (key?: string) => {
    if (key === 'pizzaCover') return ASSETS.pizzaCover;
    if (key === 'burgerCover') return ASSETS.burgerCover;
    if (key === 'margherita') return ASSETS.margherita;
    if (key === 'penne') return ASSETS.penne;
    return ASSETS.promoBanner;
  };

  if (initialLoading || !searchData) {
    return (
      <View className="flex-1 bg-background-offWhite">
        {/* Header Skeleton */}
        <View
          style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
          className="px-5 pb-3 bg-white border-b border-slate-200/80"
        >
          <Skeleton height={28} width="40%" borderRadius={8} className="mb-3" />
          <View className="flex-row items-center space-x-2">
            <Skeleton height={44} className="flex-1 mr-2" borderRadius={16} />
            <Skeleton width={44} height={44} borderRadius={16} />
          </View>
        </View>

        {/* Catalog Body Skeleton */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4 pb-10">
          <View className="flex-row mb-5">
            <Skeleton width={90} height={36} borderRadius={16} className="mr-2" />
            <Skeleton width={80} height={36} borderRadius={16} className="mr-2" />
            <Skeleton width={95} height={36} borderRadius={16} className="mr-2" />
            <Skeleton width={85} height={36} borderRadius={16} />
          </View>

          <Skeleton height={14} width="35%" borderRadius={4} className="mb-4" />

          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />

          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  const { categories, popularSearches } = searchData;

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'restaurant') {
      return (
        <Pressable
          key={item.id}
          onPress={() => {
            addSearch(item.name);
            router.push({ pathname: '/restaurant/[id]', params: { id: item.id } });
          }}
          className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs mb-4 active:opacity-95"
        >
          <View className="h-32 w-full relative">
            <Image
              source={getItemImage(item.imageKey)}
              className="w-full h-full"
              resizeMode="cover"
            />
            {item.discountBadge && (
              <View className="absolute top-2 left-2 bg-emerald-600 px-2.5 py-1 rounded-lg">
                <Text className="text-[10px] font-extrabold text-white">
                  {item.discountBadge}
                </Text>
              </View>
            )}
          </View>

          <View className="p-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Image
                source={{ uri: item.logoUrl }}
                className="w-10 h-10 rounded-full border border-slate-200 mr-3"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900 mb-0.5">{item.name}</Text>
                <Text className="text-[11px] font-medium text-slate-500 mb-1">
                  {item.cuisine}
                </Text>
                <View className="flex-row items-center space-x-2">
                  <View className="flex-row items-center mr-2">
                    <Ionicons name="star" size={12} color="#f59e0b" style={{ marginRight: 2 }} />
                    <Text className="text-xs font-bold text-slate-800">{item.rating}</Text>
                  </View>
                  <Text className="text-[11px] font-medium text-slate-500 mr-2">
                    ⏱ {item.deliveryTime}
                  </Text>
                  <Text className="text-[11px] font-medium text-slate-500">
                    📍 {item.distance}
                  </Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#16a34a" />
          </View>
        </Pressable>
      );
    }

    // Dish Item
    return (
      <Pressable
        key={item.id}
        onPress={() => {
          addSearch(item.name);
          router.push({ pathname: '/restaurant/[id]', params: { id: 'pizza-hut' } });
        }}
        className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs mb-3 flex-row items-center justify-between active:bg-slate-50"
      >
        <Image
          source={getItemImage(item.imageKey)}
          className="w-20 h-20 rounded-xl mr-3 bg-slate-100"
          resizeMode="cover"
        />

        <View className="flex-1 mr-2 justify-between h-20 py-0.5">
          <View>
            <Text className="text-sm font-bold text-slate-900 mb-0.5" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-[11px] font-semibold text-emerald-700 mb-0.5">
              {item.restaurantName}
            </Text>
            <Text className="text-xs text-slate-500 leading-4" numberOfLines={1}>
              {item.description}
            </Text>
          </View>

          <Text className="text-sm font-extrabold text-primary">{item.price} DH</Text>
        </View>

        <View className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center">
          <Ionicons name="chevron-forward" size={16} color="#16a34a" />
        </View>
      </Pressable>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setIsDropdownVisible(false)}>
      <View className="flex-1 bg-background-offWhite">
        {/* Top Search Bar Header */}
        <View
          style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
          className="px-5 pb-3 bg-white border-b border-slate-200/80 z-20 relative"
        >
          <Text className="text-2xl font-extrabold text-slate-900 mb-3">Recherche</Text>

          {/* Input & Filter Controls Container */}
          <View className="flex-row items-center space-x-2 relative z-30">
            <View className="flex-1 flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 mr-2">
              <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
              <TextInput
                className="flex-1 text-xs font-semibold text-slate-900"
                placeholder="Rechercher un restaurant, un plat..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setIsDropdownVisible(true);
                }}
                onFocus={() => setIsDropdownVisible(true)}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    setIsDropdownVisible(true);
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={16} color="#94a3b8" />
                </Pressable>
              )}
            </View>

            {/* Filter Button with Active Badge */}
            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-center shadow-2xs relative"
            >
              <Ionicons name="options-outline" size={20} color="#16a34a" />
              {activeFiltersCount > 0 && (
                <View className="absolute -top-1.5 -right-1.5 bg-emerald-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                  <Text className="text-[10px] font-extrabold text-white">
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Predictive Search Dropdown Overlay */}
          <PredictiveSearchDropdown
            visible={isDropdownVisible}
            query={searchQuery}
            debouncedQuery={debouncedQuery}
            searchData={searchData}
            onSelectSuggestion={handleSelectSuggestion}
            onClose={() => setIsDropdownVisible(false)}
          />
        </View>

        {/* Offline Cached Data Indicator */}
        {isOfflineData && (
          <View className="mx-5 mt-2 mb-1 flex-row items-center bg-amber-50 border border-amber-300 rounded-2xl px-3.5 py-2">
            <Ionicons name="cloud-offline-outline" size={15} color="#d97706" style={{ marginRight: 8 }} />
            <View className="flex-1">
              <Text className="text-[11px] font-bold text-amber-900">
                Catalogue hors ligne
              </Text>
              <Text className="text-[10px] font-medium text-amber-700">
                Données en cache{lastCachedAt ? ` · Mis à jour le ${new Date(lastCachedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Main Paginated Results List with Pull-To-Refresh & Infinite Scroll */}

        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
          onScrollBeginDrag={() => setIsDropdownVisible(false)}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#16a34a']}
              tintColor="#16a34a"
            />
          }
          ListHeaderComponent={
            <View className="mb-2">
              {/* Category Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      className={`mr-2.5 flex-row items-center px-4 py-2.5 rounded-2xl border ${
                        isSelected
                          ? 'bg-emerald-50 border-primary shadow-2xs'
                          : 'bg-white border-slate-200/80'
                      }`}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={isSelected ? '#16a34a' : '#64748b'}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-primary' : 'text-slate-700'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Active Filters Notification Banner */}
              {activeFiltersCount > 0 && (
                <View className="flex-row items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl px-3.5 py-2.5 mb-4">
                  <View className="flex-row items-center space-x-1.5">
                    <Ionicons name="filter" size={15} color="#16a34a" />
                    <Text className="text-xs font-bold text-emerald-800 ml-1">
                      {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif
                      {activeFiltersCount > 1 ? 's' : ''}
                    </Text>
                  </View>

                  <Pressable onPress={resetFilters} hitSlop={6} className="flex-row items-center">
                    <Ionicons name="refresh-outline" size={13} color="#16a34a" style={{ marginRight: 4 }} />
                    <Text className="text-xs font-bold text-emerald-700 underline">
                      Réinitialiser les filtres
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Popular Search Keywords */}
              {!searchQuery && (
                <View className="mb-5">
                  <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Recherches populaires
                  </Text>

                  <View className="flex-row flex-wrap">
                    {popularSearches.map((kw, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => handleSelectSuggestion(kw)}
                        className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-full mr-2 mb-2 shadow-2xs active:bg-slate-100 flex-row items-center"
                      >
                        <Text className="text-xs font-semibold text-slate-700">🔍 {kw}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Résultats
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="Aucun résultat trouvé"
              description="Essayez de rechercher un autre mot-clé ou de réinitialiser vos filtres."
              iconName="search-outline"
              ctaText={activeFiltersCount > 0 ? 'Réinitialiser les filtres' : undefined}
              onCtaPress={activeFiltersCount > 0 ? resetFilters : undefined}
              containerClassName="items-center justify-center py-10 bg-white rounded-2xl border border-slate-200/80 p-6 my-2"
            />
          }

          ListFooterComponent={
            loadingMore ? (
              <View className="py-2">
                <ProductCardSkeleton />
              </View>
            ) : !hasMore && displayedItems.length > 0 ? (
              <View className="py-4 items-center justify-center">
                <Text className="text-xs font-semibold text-slate-400">
                  • Vous avez vu tous les résultats •
                </Text>
              </View>
            ) : null
          }
        />

        {/* Filter Modal */}
        <CatalogFilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
