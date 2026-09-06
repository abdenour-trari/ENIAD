import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MenuCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CategorySelectorProps {
  categories: MenuCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View className="py-2.5 bg-white border-b border-slate-200/80">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              className={`mr-3 items-center justify-center rounded-2xl py-2 px-3 border min-w-[70px] ${
                isSelected
                  ? 'bg-emerald-50/80 border-primary shadow-2xs'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <Ionicons
                name={cat.icon}
                size={22}
                color={isSelected ? '#16a34a' : '#ea580c'}
                style={{ marginBottom: 4 }}
              />
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? 'text-primary font-bold' : 'text-slate-700'
                }`}
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
