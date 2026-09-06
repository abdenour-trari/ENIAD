import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileDataType } from '@/services/dataService';

interface BadgeSectionProps {
  badges: ProfileDataType['badges'];
  level: ProfileDataType['level'];
  onSeeAllPress?: () => void;
}

export const BadgeSection: React.FC<BadgeSectionProps> = ({
  badges,
  level,
  onSeeAllPress,
}) => {
  const getBadgeColor = (color: string) => {
    if (color === 'orange') return { bg: 'bg-orange-500', text: 'text-orange-950', border: 'border-orange-200' };
    if (color === 'purple') return { bg: 'bg-purple-600', text: 'text-purple-950', border: 'border-purple-200' };
    return { bg: 'bg-emerald-600', text: 'text-emerald-950', border: 'border-emerald-200' };
  };

  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-bold text-slate-900">Mes badges</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir tous</Text>
        </Pressable>
      </View>

      {/* Hexagon Badges Row */}
      <View className="flex-row justify-between mb-4 space-x-2">
        {badges.map((b) => {
          const colors = getBadgeColor(b.color);
          return (
            <View
              key={b.id}
              className="flex-1 bg-slate-50/80 rounded-2xl p-3 items-center border border-slate-200/70"
            >
              {/* Hexagon Icon Badge */}
              <View
                className={`w-12 h-12 rounded-2xl ${colors.bg} items-center justify-center shadow-md mb-2 border border-white`}
              >
                <Ionicons name={b.icon as any} size={22} color="#ffffff" />
              </View>

              <Text className="text-xs font-bold text-slate-900 text-center mb-0.5" numberOfLines={1}>
                {b.title}
              </Text>
              <Text className="text-[10px] text-slate-500 font-medium text-center" numberOfLines={2}>
                {b.description}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Next Level Progress Banner */}
      <View className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3">
        <Text className="text-xs font-bold text-slate-900 mb-0.5">
          Prochain niveau : <Text className="text-emerald-700">{level.nextLevel}</Text>
        </Text>
        <Text className="text-[11px] text-slate-600 font-medium mb-2">
          Encore {level.pointsRemaining} points pour débloquer plus d'avantages !
        </Text>

        <View className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-1">
          <View
            className="h-full bg-emerald-600 rounded-full"
            style={{ width: `${(level.currentPoints / level.targetPoints) * 100}%` }}
          />
        </View>

        <Text className="text-[10px] font-bold text-slate-700 text-right">
          {level.currentPoints} / {level.targetPoints} pts
        </Text>
      </View>
    </View>
  );
};
