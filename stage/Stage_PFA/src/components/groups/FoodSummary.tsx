import React from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { ASSETS } from '@/assets';
import { GroupFoodType } from '@/services/dataService';

interface FoodSummaryProps {
  foods: GroupFoodType[];
  onSeeAllPress?: () => void;
}

export const FoodSummarySection: React.FC<FoodSummaryProps> = ({ foods, onSeeAllPress }) => {
  const getImage = (food: GroupFoodType) => {
    if (food.imageKey === 'margherita') return ASSETS.margherita;
    if (food.imageKey === 'burgerCover') return ASSETS.burgerCover;
    if (food.imageKey === 'alfredo') return ASSETS.alfredo;
    if (food.imageUrl) return { uri: food.imageUrl };
    return ASSETS.margherita;
  };

  const totalItems = foods.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-slate-900">
          Commandes ({totalItems})
        </Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir tout</Text>
        </Pressable>
      </View>

      {/* Horizontal Foods Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {foods.map((food) => (
          <View
            key={food.id}
            className="mr-3 w-32 bg-slate-50 rounded-xl overflow-hidden border border-slate-200/80 p-2"
          >
            <View className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-white">
              <Image
                source={getImage(food)}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            <Text className="text-xs font-bold text-slate-900 mb-0.5" numberOfLines={1}>
              {food.name}
            </Text>

            <Text className="text-[11px] font-semibold text-slate-500">
              {food.quantity}x • <Text className="font-extrabold text-slate-800">{food.unitPrice} DH</Text>
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
