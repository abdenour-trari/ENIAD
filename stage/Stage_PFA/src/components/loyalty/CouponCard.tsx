import React from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { LoyaltyDataType } from '@/services/dataService';

interface CouponCardProps {
  coupons: LoyaltyDataType['coupons'];
  onSeeAllPress?: () => void;
  onUseCoupon?: (coupon: LoyaltyDataType['coupons'][0]) => void;
}

export const CouponSection: React.FC<CouponCardProps> = ({
  coupons,
  onSeeAllPress,
  onUseCoupon,
}) => {
  return (
    <View className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <Text className="text-sm font-bold text-slate-900">Coupons disponibles</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir tous</Text>
        </Pressable>
      </View>

      {/* Coupons List */}
      <View className="space-y-3">
        {coupons.map((cp) => (
          <View
            key={cp.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200 overflow-hidden">
                <Image
                  source={{ uri: cp.restaurantLogo }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              <View className="flex-1">
                <View className="bg-emerald-100 self-start px-2 py-0.5 rounded border border-emerald-200 mb-1">
                  <Text className="text-[10px] font-bold text-emerald-800">
                    {cp.discountBadge}
                  </Text>
                </View>

                <Text className="text-xs font-bold text-slate-900 mb-0.5" numberOfLines={1}>
                  {cp.title}
                </Text>

                <Text className="text-[10px] font-medium text-slate-400">
                  {cp.validUntil}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                onUseCoupon
                  ? onUseCoupon(cp)
                  : Alert.alert('Coupon Activé ! 🎉', `Code promo appliqué pour ${cp.restaurantName}`)
              }
              className="bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-xl active:bg-emerald-100"
            >
              <Text className="text-xs font-bold text-emerald-800">Utiliser</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
};
