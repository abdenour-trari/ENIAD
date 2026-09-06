import React, { useRef } from 'react';
import { View, Text, Image, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASSETS } from '@/assets';

export interface FoodItem {
  id: string;
  restaurantId?: string;
  categoryId?: string;
  name: string;
  description: string;
  price: number;
  badge?: string;
  imageKey?: string;
  imageUrl?: string;
}

interface FoodCardProps {
  food: FoodItem;
  onAddToCart: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onAddToCart }) => {
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Micro-animation on button click
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1.0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    onAddToCart(food);
  };

  const getImageSource = () => {
    if (food.imageKey === 'margherita') return ASSETS.margherita;
    if (food.imageKey === 'fourCheese') return ASSETS.fourCheese;
    if (food.imageKey === 'penne') return ASSETS.penne;
    if (food.imageKey === 'burgerCover') return ASSETS.burgerCover;
    if (food.imageKey === 'pizzaCover') return ASSETS.pizzaCover;
    if (food.imageUrl) return { uri: food.imageUrl };
    return ASSETS.margherita;
  };

  return (
    <View className="flex-row items-center bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs mb-3">
      {/* Dish Photo */}
      <View className="w-24 h-24 rounded-xl overflow-hidden mr-3 bg-slate-100">
        <Image
          source={getImageSource()}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Dish Details */}
      <View className="flex-1 justify-between h-24 py-0.5">
        <View>
          {food.badge && (
            <View className="bg-orange-100 self-start px-2 py-0.5 rounded-md mb-1 border border-orange-200">
              <Text className="text-[10px] font-bold text-orange-600">
                {food.badge}
              </Text>
            </View>
          )}

          <Text className="text-base font-bold text-slate-900 mb-0.5" numberOfLines={1}>
            {food.name}
          </Text>

          <Text className="text-xs text-slate-500 leading-4" numberOfLines={2}>
            {food.description}
          </Text>
        </View>

        {/* Price & Add Button */}
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-sm font-extrabold text-primary">
            {food.price} DH
          </Text>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              onPress={handlePress}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center border border-slate-200 active:bg-primary active:border-primary"
            >
              <Ionicons name="add" size={18} color="#16a34a" />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default FoodCard;
