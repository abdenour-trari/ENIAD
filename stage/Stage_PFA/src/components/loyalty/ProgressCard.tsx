import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressCardProps {
  currentPoints: number;
  targetPoints: number;
  nextLevel: string;
  pointsRemaining: number;
  onPress?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  currentPoints,
  targetPoints,
  nextLevel,
  pointsRemaining,
  onPress,
}) => {
  const percent = Math.min((currentPoints / targetPoints) * 100, 100);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs mb-4 active:bg-slate-50"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-2">
          <Text className="text-lg mr-1.5">👑</Text>
          <View>
            <Text className="text-xs font-bold text-slate-900">
              Prochain niveau : <Text className="text-emerald-700 font-extrabold">{nextLevel}</Text>
            </Text>
            <Text className="text-[11px] font-medium text-slate-500">
              Encore {pointsRemaining} points pour atteindre le niveau {nextLevel}
            </Text>
          </View>
        </View>

        {/* Gold Hexagon Icon */}
        <View className="w-8 h-8 rounded-xl bg-amber-500 items-center justify-center border border-white shadow-2xs">
          <Ionicons name="shield" size={16} color="#ffffff" />
        </View>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-1.5 border border-slate-200/60">
        <View
          className="h-full bg-emerald-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-[10px] font-bold text-slate-700">
          {currentPoints.toLocaleString()} / {targetPoints.toLocaleString()} pts
        </Text>
      </View>
    </Pressable>
  );
};
