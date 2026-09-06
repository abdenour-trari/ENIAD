import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressGaugeProps {
  currentPoints: number;
  targetPoints: number;
  nextRewardName?: string;
  nextLevelName?: string;
  onPress?: () => void;
}

/**
 * Animated Progress Gauge component for Loyalty Screen.
 * Replaces raw points text with a smooth NativeWind animated progress bar, percentage badge,
 * and remaining points callout.
 */
export const ProgressGauge: React.FC<ProgressGaugeProps> = ({
  currentPoints,
  targetPoints,
  nextRewardName = 'Réduction -15% Pizza Hut',
  nextLevelName = 'Or',
  onPress,
}) => {
  const percentage = Math.min(100, Math.round((currentPoints / targetPoints) * 100));
  const pointsRemaining = Math.max(0, targetPoints - currentPoints);

  // Animated progress width
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedWidth.setValue(0);
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [percentage, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPress={onPress}
      className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm mb-5 active:bg-slate-50"
    >
      {/* Top Header & Percentage Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/40 items-center justify-center mr-3">
            <Ionicons name="trophy" size={20} color="#d97706" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Objectif Récompense
            </Text>
            <Text className="text-sm font-extrabold text-slate-900" numberOfLines={1}>
              {nextRewardName}
            </Text>
          </View>
        </View>

        <View className="bg-emerald-600 px-3 py-1.5 rounded-full shadow-2xs">
          <Text className="text-xs font-black text-white">{percentage}%</Text>
        </View>
      </View>

      {/* Animated NativeWind Progress Bar */}
      <View className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden mb-3 border border-slate-200/80 p-0.5">
        <Animated.View
          style={{ width: widthInterpolation }}
          className="h-full bg-emerald-600 rounded-full"
        />
      </View>

      {/* Stats Breakdown Row */}
      <View className="flex-row items-center justify-between pt-1 border-t border-slate-100">
        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
          <Text className="text-xs font-extrabold text-slate-900">
            {currentPoints.toLocaleString()}{' '}
            <Text className="text-slate-400 font-normal">/ {targetPoints.toLocaleString()} pts</Text>
          </Text>
        </View>

        <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
          <Text className="text-[11px] font-bold text-emerald-800">
            {pointsRemaining === 0 ? '🎁 Cadeau débloqué !' : `Plus que ${pointsRemaining} pts`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ProgressGauge;
