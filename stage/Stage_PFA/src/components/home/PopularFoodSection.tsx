import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASSETS } from '@/assets';

export interface PopularFoodItem {
  id: string;
  name: string;
  price: number;
  imageKey: string;
}

interface PopularFoodSectionProps {
  items: PopularFoodItem[];
  onSelectItem?: (id: string) => void;
  onSeeAllPress?: () => void;
}

const getImageSource = (key: string) => {
  const map: Record<string, any> = {
    sandwichPoulet: ASSETS.sandwichPoulet,
    sandwichThon: ASSETS.sandwichThon,
    sandwichViande: ASSETS.sandwichViande,
    sandwichOeuf: ASSETS.sandwichOeuf,
  };
  return map[key] || ASSETS.sandwichPoulet;
};

export const PopularFoodSection: React.FC<PopularFoodSectionProps> = ({
  items,
  onSelectItem,
  onSeeAllPress,
}) => {
  return (
    <View className="py-3">
      {/* Section Title */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-lg font-bold text-slate-900">
          Sandwichs populaires aujourd'hui 🥪
        </Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold" style={{ color: '#7C3AED' }}>Voir tout</Text>
        </Pressable>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelectItem?.(item.id)}
            className="mr-3 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
            style={{ width: 150 }}
          >
            {/* Image Container */}
            <View className="relative" style={{ height: 110 }}>
              <Image
                source={getImageSource(item.imageKey)}
                className="w-full h-full"
                resizeMode="cover"
              />

              {/* Populaire Badge */}
              <View
                className="absolute bottom-2 left-2 rounded-full px-2.5 py-0.5"
                style={{ backgroundColor: '#7C3AED' }}
              >
                <Text className="text-[10px] font-bold text-white">Populaire</Text>
              </View>

              {/* Heart Icon */}
              <Pressable className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 items-center justify-center shadow-sm">
                <Ionicons name="heart-outline" size={14} color="#64748b" />
              </Pressable>
            </View>

            {/* Content */}
            <View className="p-2.5">
              <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs font-semibold text-slate-500 mt-0.5">
                {item.price} DH
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
