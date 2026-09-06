import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  dataService,
  RestaurantDetailType,
  FoodCategoryType,
} from '@/services/dataService';
import {
  RestaurantHeader,
  OfferSection,
  ReviewSection,
  CategorySelector,
  FoodCard,
  FoodItem,
  StickyCartBar,
  Skeleton,
  ProductCardSkeleton,
  Toast,
} from '@/components';
import { useCartStore } from '@/store';

/**
 * Pixel-Perfect Restaurant Detail Screen matching Jiblina mockup.
 * Features optimistic add-to-cart, tactile button micro-animations, instant badge increments,
 * silent state rollback with discrete Toast notifications on server error, and persistent Zustand cart integration.
 */
export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<RestaurantDetailType | null>(null);
  const [categories, setCategories] = useState<FoodCategoryType[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('pizzas');
  const [activeTab, setActiveTab] = useState<'overview' | 'menu'>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Persistent Zustand cart store & optimistic actions
  const { cart, getItemCount, getTotalAmount, addToCartOptimistic, toast, hideToast } = useCartStore();
  const cartItemCount = getItemCount();
  const totalAmount = getTotalAmount();

  useEffect(() => {
    async function loadRestaurantData() {
      try {
        const restoRes = await dataService.getRestaurantById(id || 'pizza-hut');
        const foodsRes = await dataService.getFoodsByRestaurant(id || 'pizza-hut');

        if (restoRes.data) {
          setRestaurant(restoRes.data);
        }
        if (foodsRes.data) {
          setCategories(foodsRes.data.categories);
          setFoods(foodsRes.data.foods as FoodItem[]);
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRestaurantData();
  }, [id]);

  const handleAddFoodToCart = (food: FoodItem) => {
    addToCartOptimistic(
      {
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        unit: 'portion',
        categoryId: food.categoryId || 'menu',
        imageUrl: food.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        rating: 4.8,
        isAvailable: true,
      },
      1
    );
  };

  if (loading || !restaurant) {
    return (
      <View className="flex-1 bg-background-offWhite">
        {/* Header Cover Banner & Profile Skeleton */}
        <View className="relative bg-white pb-4 border-b border-slate-200">
          <Skeleton width="100%" height={180} borderRadius={0} />
          <View className="px-5 pt-4 flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Skeleton height={24} width="65%" borderRadius={8} className="mb-2" />
              <Skeleton height={14} width="45%" borderRadius={4} className="mb-2" />
              <Skeleton height={14} width="85%" borderRadius={4} />
            </View>
            <Skeleton width={50} height={50} borderRadius={25} />
          </View>
        </View>

        {/* Tab Switcher Skeleton */}
        <View className="flex-row bg-white border-b border-slate-200 px-5 py-2.5 mb-3">
          <Skeleton height={36} className="flex-1 mr-2" borderRadius={12} />
          <Skeleton height={36} className="flex-1 ml-2" borderRadius={12} />
        </View>

        {/* Food Dishes Menu List Skeletons */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-2">
          <Skeleton height={20} width="40%" borderRadius={6} className="mb-4" />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  const filteredFoods = foods.filter(
    (f) => selectedCategoryId === 'all' || f.categoryId === selectedCategoryId
  );

  return (
    <View className="flex-1 bg-background-offWhite relative">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">
        {/* 1. Header Component */}
        <RestaurantHeader
          restaurant={restaurant}
          onBackPress={() => router.back()}
          onFavoritePress={() => Alert.alert('Favoris', 'Restaurant ajouté à vos favoris')}
          onSharePress={() => Alert.alert('Partager', 'Lien du restaurant copié')}
          onGroupOrderPress={() => router.push('/group-order')}
        />

        {/* Tab Switcher */}
        <View className="flex-row bg-white border-y border-slate-200/80 px-5 py-2 mb-2">
          <Pressable
            onPress={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-xl items-center mr-2 ${
              activeTab === 'overview' ? 'bg-primary' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'overview' ? 'text-white' : 'text-slate-700'
              }`}
            >
              Présentation & Avis
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('menu')}
            className={`flex-1 py-2 rounded-xl items-center ml-2 ${
              activeTab === 'menu' ? 'bg-primary' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'menu' ? 'text-white' : 'text-slate-700'
              }`}
            >
              Carte & Menu ({foods.length})
            </Text>
          </Pressable>
        </View>

        {activeTab === 'overview' ? (
          <>
            {/* 2. Special Offers Component */}
            <OfferSection
              offers={restaurant.offers as any}
              onAddOffer={(offer) =>
                handleAddFoodToCart({
                  id: offer.id,
                  restaurantId: restaurant.id,
                  categoryId: 'offers',
                  name: offer.title,
                  description: 'Formule spéciale avec réduction',
                  price: 65,
                  badge: offer.badge,
                })
              }
              onSeeAllPress={() => setActiveTab('menu')}
            />

            {/* 3. Reviews Component */}
            <ReviewSection
              score={restaurant.reviewSummary.average}
              totalReviews={restaurant.reviewSummary.totalReviews}
              breakdown={restaurant.reviewSummary.breakdown}
              reviews={restaurant.customerReviews as any}
            />
          </>
        ) : (
          <View className="bg-white pt-2">
            {/* 4. Category Selector Component */}
            <CategorySelector
              categories={categories as any}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />

            {/* Collective Order Callout Banner */}
            <View className="mx-5 my-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex-row items-center justify-between shadow-2xs">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-3 border border-emerald-300">
                  <Ionicons name="people" size={18} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-900">
                    Commande collective
                  </Text>
                  <Text className="text-[11px] font-medium text-emerald-700">
                    Créez ou rejoignez un groupe et économisez !
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#16a34a" />
            </View>

            {/* 5. Food Dishes List (FoodCard Component) */}
            <View className="px-5 pt-2 pb-6">
              <Text className="text-lg font-extrabold text-slate-900 mb-3 capitalize">
                {categories.find((c) => c.id === selectedCategoryId)?.name || 'Pizzas'}
              </Text>

              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onAddToCart={(item) => handleAddFoodToCart(item)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Cart Footer Bar with Badge Micro-Animation */}
      <StickyCartBar
        itemCount={cartItemCount}
        totalPrice={totalAmount}
        onPressCart={() => router.push('/cart')}
        onContinue={() => router.push('/cart')}
      />

      {/* Discrete Error/Info Toast Component */}
      <Toast
        visible={!!toast}
        message={toast?.message || ''}
        type={toast?.type || 'error'}
        onDismiss={hideToast}
      />
    </View>
  );
}
