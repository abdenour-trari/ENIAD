import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface CategoryItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
}

interface CategoryListProps {
  categories: CategoryItem[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onSeeAllPress?: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onSeeAllPress,
}) => {
  return (
    <View className="py-3">
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-lg font-bold text-slate-900">Catégories</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir tout</Text>
        </Pressable>
      </View>

      {/* Horizontal Categories Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id || (selectedCategoryId === '' && cat.id === 'all');
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              className={`mr-3 items-center justify-center rounded-2xl p-3 border w-20 h-24 ${
                isSelected
                  ? 'bg-emerald-50 border-primary shadow-xs'
                  : 'bg-white border-slate-200/90 shadow-2xs'
              }`}
            >
              <View className="mb-2">
                <Ionicons
                  name={cat.icon}
                  size={26}
                  color={isSelected ? COLORS.primary[600] : '#f97316'}
                />
              </View>
              <Text
                className={`text-xs font-bold text-center ${
                  isSelected ? 'text-primary' : 'text-slate-700'
                }`}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
