import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASSETS } from '@/assets';

export interface OfferItem {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  discountText: string;
  imageKey: string;
}

interface OfferSectionProps {
  offers: OfferItem[];
  onAddOffer: (offer: OfferItem) => void;
  onSeeAllPress?: () => void;
}

export const OfferSection: React.FC<OfferSectionProps> = ({
  offers,
  onAddOffer,
  onSeeAllPress,
}) => {
  const getImage = (key: string) => {
    if (key === 'penne') return ASSETS.penne;
    return ASSETS.pizzaCover;
  };

  return (
    <View className="py-3 bg-white mb-2">
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-base font-bold text-slate-900">Offres spéciales</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir tout</Text>
        </Pressable>
      </View>

      {/* Horizontal Offers Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {offers.map((offer) => (
          <View
            key={offer.id}
            className="mr-4 w-52 bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs"
          >
            {/* Offer Cover Image */}
            <View className="h-32 w-full relative">
              <Image
                source={getImage(offer.imageKey)}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View
                className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg ${
                  offer.badgeColor === 'green' ? 'bg-emerald-600' : 'bg-orange-500'
                }`}
              >
                <Text className="text-[10px] font-bold text-white">{offer.badge}</Text>
              </View>
            </View>

            {/* Offer Content */}
            <View className="p-3">
              <Text className="text-sm font-bold text-slate-900 mb-0.5">
                {offer.title}
              </Text>
              <Text className="text-base font-extrabold text-primary mb-2">
                {offer.discountText}
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-slate-400">Voir l'offre</Text>
                <Pressable
                  onPress={() => onAddOffer(offer)}
                  className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-xs active:bg-primary-700"
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
