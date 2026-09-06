import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { ASSETS } from '@/assets';

interface PromoBannerProps {
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  discountText: string;
  onPress?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  badge,
  titlePrefix,
  titleHighlight,
  discountText,
  onPress,
}) => {
  return (
    <View className="px-5 py-2">
      <Pressable
        onPress={onPress}
        className="rounded-3xl overflow-hidden shadow-md flex-row items-center justify-between p-4 relative"
        style={{
          backgroundColor: '#eaf4eb',
          minHeight: 140,
        }}
      >
        {/* Left Content */}
        <View className="flex-1 z-10 pr-2">
          {/* Badge */}
          <View className="bg-white/90 self-start px-2.5 py-1 rounded-full border border-orange-200 mb-2 shadow-2xs">
            <Text className="text-[11px] font-bold text-orange-600">{badge}</Text>
          </View>

          {/* Headline */}
          <Text className="text-lg font-bold text-slate-900 leading-6">
            Économise plus{' '}
          </Text>
          <Text className="text-lg font-extrabold text-slate-900 leading-6">
            en commandant{' '}
          </Text>
          <Text className="text-lg font-extrabold text-primary leading-6 mb-3">
            ensemble !
          </Text>

          {/* Discount Pill */}
          <View className="bg-[#168a3c] px-3 py-1.5 rounded-full self-start">
            <Text className="text-[11px] font-bold text-white">
              {discountText}
            </Text>
          </View>
        </View>

        {/* Right Food Image */}
        <View className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-white/80 shadow-md">
          <Image
            source={ASSETS.promoBanner}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </Pressable>

      {/* Pagination Dots */}
      <View className="flex-row justify-center items-center mt-2.5 space-x-1.5">
        <View className="w-6 h-1.5 rounded-full bg-primary" />
        <View className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
        <View className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
        <View className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
      </View>
    </View>
  );
};
