import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoyaltyCardProps {
  levelTitle: string;
  currentPoints: number;
  nextLevelPoints: number;
  buttonText: string;
  onRewardsPress?: () => void;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  levelTitle,
  currentPoints,
  nextLevelPoints,
  buttonText,
  onRewardsPress,
}) => {
  const progressPercent = Math.min((currentPoints / nextLevelPoints) * 100, 100);

  return (
    <View className="px-5 py-3 mb-6">
      <View
        className="rounded-2xl p-4 flex-row items-center border border-amber-200/90 shadow-sm"
        style={{ backgroundColor: '#fffbeb' }}
      >
        {/* Left Golden Trophy Circle */}
        <View className="w-12 h-12 rounded-full bg-amber-400 items-center justify-center mr-3 shadow-2xs border border-amber-300">
          <Ionicons name="trophy" size={24} color="#ffffff" />
        </View>

        {/* Center Level & Progress */}
        <View className="flex-1 mr-2">
          <View className="flex-row items-center justify-between mb-1">
            <View>
              <Text className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Ton niveau
              </Text>
              <Text className="text-sm font-bold text-slate-900">{levelTitle}</Text>
            </View>
            <Text className="text-sm font-extrabold text-amber-600">
              {currentPoints} pts
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="w-full h-2 rounded-full bg-amber-100 overflow-hidden mb-1 border border-amber-200/50">
            <View
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>

          <Text className="text-[10px] font-medium text-slate-400">
            Prochain niveau à {nextLevelPoints} pts
          </Text>
        </View>

        {/* Right Button */}
        <Pressable
          onPress={onRewardsPress}
          className="border border-emerald-600 bg-white/90 px-3 py-2 rounded-xl flex-row items-center shadow-2xs active:bg-emerald-50"
        >
          <Ionicons name="gift-outline" size={14} color="#16a34a" style={{ marginRight: 4 }} />
          <Text className="text-xs font-bold text-emerald-700">{buttonText}</Text>
        </Pressable>
      </View>
    </View>
  );
};
