import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchStore } from '@/store';
import { SearchDataType } from '@/services/dataService';

interface PredictiveSearchDropdownProps {
  visible: boolean;
  query: string;
  debouncedQuery: string;
  searchData: SearchDataType | null;
  onSelectSuggestion: (term: string) => void;
  onClose?: () => void;
}

export const PredictiveSearchDropdown: React.FC<PredictiveSearchDropdownProps> = ({
  visible,
  query,
  debouncedQuery,
  searchData,
  onSelectSuggestion,
}) => {
  const { history, removeSearch, clearHistory } = useSearchStore();

  if (!visible) return null;

  const trimmedQuery = query.trim();
  const trimmedDebounced = debouncedQuery.trim().toLowerCase();

  // Compute real-time predictive suggestions when search query is typed
  const suggestions = React.useMemo(() => {
    if (!trimmedDebounced || !searchData) return [];

    const matches: Array<{
      id: string;
      name: string;
      type: 'restaurant' | 'food' | 'category';
      subtitle?: string;
    }> = [];

    // Search categories
    searchData.categories.forEach((cat) => {
      if (cat.id !== 'all' && cat.name.toLowerCase().includes(trimmedDebounced)) {
        matches.push({
          id: `cat-${cat.id}`,
          name: cat.name,
          type: 'category',
          subtitle: 'Catégorie',
        });
      }
    });

    // Search restaurants & food items
    searchData.results.forEach((item) => {
      if (item.type === 'restaurant') {
        const matchesName = item.name.toLowerCase().includes(trimmedDebounced);
        const matchesCuisine = item.cuisine?.toLowerCase().includes(trimmedDebounced);
        if (matchesName || matchesCuisine) {
          matches.push({
            id: item.id,
            name: item.name,
            type: 'restaurant',
            subtitle: item.cuisine || 'Restaurant',
          });
        }
      } else if (item.type === 'food') {
        const matchesName = item.name.toLowerCase().includes(trimmedDebounced);
        const matchesDesc = item.description?.toLowerCase().includes(trimmedDebounced);
        const matchesResto = item.restaurantName?.toLowerCase().includes(trimmedDebounced);
        if (matchesName || matchesDesc || matchesResto) {
          matches.push({
            id: item.id,
            name: item.name,
            type: 'food',
            subtitle: `${item.restaurantName || 'Plat'} • ${item.price} DH`,
          });
        }
      }
    });

    return matches.slice(0, 6);
  }, [trimmedDebounced, searchData]);

  const showHistory = !trimmedQuery;

  return (
    <View className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-80">
      <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {showHistory ? (
          // Recent Search History Dropdown
          <View className="p-3">
            <View className="flex-row items-center justify-between px-2 pb-2 border-b border-slate-100 mb-1">
              <View className="flex-row items-center space-x-1.5">
                <Ionicons name="time-outline" size={15} color="#64748b" />
                <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                  Historique récent
                </Text>
              </View>
              {history.length > 0 && (
                <Pressable onPress={clearHistory} hitSlop={6}>
                  <Text className="text-[11px] font-semibold text-emerald-600">Effacer tout</Text>
                </Pressable>
              )}
            </View>

            {history.length === 0 ? (
              <View className="py-4 items-center justify-center">
                <Text className="text-xs text-slate-400">Aucune recherche récente</Text>
              </View>
            ) : (
              history.map((term, index) => (
                <View
                  key={`${term}-${index}`}
                  className="flex-row items-center justify-between py-2 px-2.5 rounded-xl active:bg-slate-50"
                >
                  <Pressable
                    className="flex-1 flex-row items-center mr-2"
                    onPress={() => onSelectSuggestion(term)}
                  >
                    <Ionicons name="time-outline" size={16} color="#94a3b8" style={{ marginRight: 10 }} />
                    <Text className="text-xs font-semibold text-slate-800 flex-1" numberOfLines={1}>
                      {term}
                    </Text>
                  </Pressable>

                  {/* Individual Delete Button */}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      removeSearch(term);
                    }}
                    hitSlop={8}
                    className="p-1 rounded-full active:bg-slate-100"
                  >
                    <Ionicons name="close-outline" size={18} color="#94a3b8" />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        ) : (
          // Real-Time Predictive Results Dropdown
          <View className="p-2">
            {suggestions.length > 0 ? (
              suggestions.map((item) => {
                const iconName =
                  item.type === 'restaurant'
                    ? 'restaurant-outline'
                    : item.type === 'food'
                    ? 'fast-food-outline'
                    : 'grid-outline';

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => onSelectSuggestion(item.name)}
                    className="flex-row items-center py-2.5 px-3 rounded-xl active:bg-slate-50 border-b border-slate-50"
                  >
                    <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center mr-3 border border-emerald-100">
                      <Ionicons name={iconName} size={15} color="#16a34a" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.subtitle && (
                        <Text className="text-[10px] font-medium text-slate-500" numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
                  </Pressable>
                );
              })
            ) : (
              <View className="py-3 px-3">
                <Text className="text-xs text-slate-500">Aucune suggestion directe pour "{trimmedQuery}"</Text>
              </View>
            )}

            {/* Direct query submit option */}
            <Pressable
              onPress={() => onSelectSuggestion(trimmedQuery)}
              className="flex-row items-center py-2.5 px-3 mt-1 rounded-xl bg-slate-50 border border-slate-200/60 active:bg-slate-100"
            >
              <Ionicons name="search" size={16} color="#16a34a" style={{ marginRight: 8 }} />
              <Text className="text-xs font-semibold text-slate-800 flex-1" numberOfLines={1}>
                Rechercher « <Text className="font-bold text-emerald-700">{trimmedQuery}</Text> »
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#16a34a" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PredictiveSearchDropdown;
