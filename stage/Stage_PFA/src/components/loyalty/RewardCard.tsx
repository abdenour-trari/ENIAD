import React from 'react';
import { View, Text, Image, ScrollView, Pressable, Alert } from 'react-native';
import { ASSETS } from '@/assets';
import { LoyaltyDataType } from '@/services/dataService';

interface RewardCardProps {
  rewards: LoyaltyDataType['rewards'];
  onSeeAllPress?: () => void;
  onRedeemReward?: (reward: LoyaltyDataType['rewards'][0]) => void;
}

export const RewardCardSection: React.FC<RewardCardProps> = ({
  rewards,
  onSeeAllPress,
  onRedeemReward,
}) => {
  const getImage = (key: string) => {
    if (key === 'burgerCover') return ASSETS.burgerCover;
    if (key === 'promoBanner') return ASSETS.promoBanner;
    return ASSETS.pizzaCover;
  };

  return (
    <View className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <Text className="text-sm font-bold text-slate-900">Récompenses</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir toutes</Text>
        </Pressable>
      </View>

      {/* Horizontal Rewards Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {rewards.map((rw) => (
          <Pressable
            key={rw.id}
            onPress={() =>
              onRedeemReward
                ? onRedeemReward(rw)
                : Alert.alert('Récompense', `Débloquer "${rw.title}" pour ${rw.costPoints} points ?`)
            }
            className="mr-3 w-40 bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs p-2.5 active:bg-slate-50"
          >
            <View className="h-28 w-full rounded-xl overflow-hidden mb-2 relative bg-slate-100">
              <Image
                source={getImage(rw.imageKey)}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute top-1.5 right-1.5 bg-emerald-600 px-2 py-0.5 rounded-md shadow-xs">
                <Text className="text-[10px] font-bold text-white">{rw.badge}</Text>
              </View>
            </View>

            <Text className="text-xs font-bold text-slate-900 mb-1" numberOfLines={1}>
              {rw.title}
            </Text>

            <Text className="text-xs font-extrabold text-primary">
              {rw.costPoints} pts
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
