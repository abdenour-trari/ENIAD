import React from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFilterStore } from '@/store';

interface CatalogFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CatalogFilterModal: React.FC<CatalogFilterModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    filters,
    setPriceLevel,
    setMaxDistance,
    setMinRating,
    setMaxDeliveryTime,
    resetFilters,
    getActiveFiltersCount,
  } = useFilterStore();

  const activeCount = getActiveFiltersCount();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[85%] border-t border-slate-200 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="options-outline" size={22} color="#16a34a" />
              <Text className="text-lg font-extrabold text-slate-900 ml-2">
                Filtres du catalogue
              </Text>
              {activeCount > 0 && (
                <View className="bg-emerald-600 px-2 py-0.5 rounded-full ml-1">
                  <Text className="text-xs font-bold text-white">{activeCount}</Text>
                </View>
              )}
            </View>

            <Pressable onPress={onClose} hitSlop={8} className="p-1 rounded-full bg-slate-100">
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-6">
            {/* 1. Price Level Filter */}
            <View className="mb-5">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Niveau de prix
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { label: 'Tous', value: null },
                  { label: '$ (Économique)', value: '$' },
                  { label: '$$ (Moyen)', value: '$$' },
                  { label: '$$$ (Haut de gamme)', value: '$$$' },
                ].map((option) => {
                  const isSelected = filters.priceLevel === option.value;
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => setPriceLevel(option.value)}
                      className={`px-4 py-2.5 rounded-xl border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-emerald-700' : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 2. Max Distance Filter */}
            <View className="mb-5">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Distance maximale
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { label: 'Toute distance', value: null },
                  { label: '< 1 km', value: 1 },
                  { label: '< 2 km', value: 2 },
                  { label: '< 5 km', value: 5 },
                ].map((option) => {
                  const isSelected = filters.maxDistance === option.value;
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => setMaxDistance(option.value)}
                      className={`px-4 py-2.5 rounded-xl border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-emerald-700' : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Min Rating Filter */}
            <View className="mb-5">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Note minimale
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { label: 'Toutes les notes', value: null },
                  { label: '⭐ 4.0 et plus', value: 4.0 },
                  { label: '⭐ 4.5 et plus', value: 4.5 },
                ].map((option) => {
                  const isSelected = filters.minRating === option.value;
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => setMinRating(option.value)}
                      className={`px-4 py-2.5 rounded-xl border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-emerald-700' : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 4. Max Delivery Time Filter */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Temps de livraison maximal
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { label: 'Tout temps', value: null },
                  { label: '< 20 min', value: 20 },
                  { label: '< 30 min', value: 30 },
                  { label: '< 45 min', value: 45 },
                ].map((option) => {
                  const isSelected = filters.maxDeliveryTime === option.value;
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => setMaxDeliveryTime(option.value)}
                      className={`px-4 py-2.5 rounded-xl border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-emerald-700' : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View className="flex-row items-center space-x-3 pt-4 border-t border-slate-100">
            <Pressable
              onPress={resetFilters}
              className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 items-center justify-center active:bg-slate-100"
            >
              <Text className="text-xs font-bold text-slate-700">Réinitialiser les filtres</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-emerald-600 items-center justify-center shadow-md active:bg-emerald-700"
            >
              <Text className="text-xs font-bold text-white">Appliquer ({activeCount})</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CatalogFilterModal;
