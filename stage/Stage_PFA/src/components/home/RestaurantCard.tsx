import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASSETS } from '@/assets';

export interface RestaurantItem {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  priceRange: string;
  category: string;
  imageKey?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  initials?: string;
}

interface RestaurantSectionProps {
  restaurants: RestaurantItem[];
  onSelectRestaurant: (id: string) => void;
  onSeeAllPress?: () => void;
}

const getImageSource = (key?: string) => {
  const map: Record<string, any> = {
    restoSandwichHouse: ASSETS.restoSandwichHouse,
    restoBaguetteExpress: ASSETS.restoBaguetteExpress,
    restoCoinGourmand: ASSETS.restoCoinGourmand,
    restoStreetBites: ASSETS.restoStreetBites,
  };
  return key ? map[key] : null;
};

export const RestaurantSection: React.FC<RestaurantSectionProps> = ({
  restaurants,
  onSelectRestaurant,
  onSeeAllPress,
}) => {
  return (
    <View className="py-3">
      {/* Section Title */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-lg font-bold text-slate-900">
          Restaurants populaires aujourd'hui 🍽️
        </Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold" style={{ color: '#7C3AED' }}>Voir tout</Text>
        </Pressable>
      </View>

      {/* Horizontal Cards Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {restaurants.map((resto) => {
          const imgSource = getImageSource(resto.imageKey);

          return (
            <Pressable
              key={resto.id}
              onPress={() => onSelectRestaurant(resto.id)}
              className="mr-3 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
              style={{ width: 155 }}
            >
              {/* Restaurant Image */}
              <View style={{ height: 100 }} className="bg-slate-200">
                {imgSource ? (
                  <Image
                    source={imgSource}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="w-full h-full items-center justify-center"
                    style={{ backgroundColor: resto.bgColor || '#f1f5f9' }}
                  >
                    <Text
                      className="text-2xl font-extrabold"
                      style={{ color: resto.textColor || '#334155' }}
                    >
                      {resto.initials || resto.name[0]}
                    </Text>
                  </View>
                )}
              </View>

              {/* Restaurant Meta */}
              <View className="p-2.5">
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text
                    className="text-xs font-bold text-slate-900 flex-1 mr-1"
                    numberOfLines={1}
                  >
                    {resto.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={10} color="#f59e0b" style={{ marginRight: 2 }} />
                    <Text className="text-[11px] font-bold text-slate-700">{resto.rating}</Text>
                  </View>
                </View>

                <Text className="text-[10px] font-medium text-slate-500">
                  {resto.category} • {resto.deliveryTime}
                </Text>
                <Text className="text-[10px] font-medium text-slate-400 mt-0.5">
                  {resto.priceRange}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
