import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoyaltyDataType } from '@/services/dataService';

interface LevelCardProps {
  levels: LoyaltyDataType['levels'];
  goldPerks: string[];
  selectedLevelId: string;
  onSelectLevel: (id: string) => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  levels,
  goldPerks,
  selectedLevelId,
  onSelectLevel,
}) => {
  const getBadgeStyle = (color: string) => {
    if (color === 'gold') return { bg: 'bg-amber-500', text: 'text-amber-900', icon: '👑' };
    if (color === 'silver') return { bg: 'bg-slate-400', text: 'text-slate-800', icon: '🥈' };
    if (color === 'platinum') return { bg: 'bg-indigo-600', text: 'text-indigo-900', icon: '💎' };
    return { bg: 'bg-amber-700', text: 'text-amber-950', icon: '🥉' };
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-bold text-slate-900 mb-3 px-1">Niveaux de fidélité</Text>

      {/* Horizontal Level Nodes */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {levels.map((lvl) => {
          const isSelected = selectedLevelId === lvl.id || (lvl.isSelected && !selectedLevelId);
          const style = getBadgeStyle(lvl.color);
          return (
            <Pressable
              key={lvl.id}
              onPress={() => onSelectLevel(lvl.id)}
              className={`mr-3 w-28 bg-white rounded-2xl p-3 items-center border ${
                isSelected
                  ? 'border-emerald-600 shadow-sm bg-emerald-50/20'
                  : 'border-slate-200/90'
              }`}
            >
              <View
                className={`w-11 h-11 rounded-2xl ${style.bg} items-center justify-center mb-2 shadow-2xs`}
              >
                <Text className="text-xl">{style.icon}</Text>
              </View>

              <Text className="text-xs font-bold text-slate-900 mb-0.5">{lvl.name}</Text>
              <Text className="text-[10px] text-slate-400 font-medium text-center">
                {lvl.range}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Selected Level Perks Card */}
      <View className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 shadow-2xs">
        <Text className="text-xs font-bold text-emerald-950 mb-3">
          Tes avantages au niveau Gold
        </Text>

        <View className="space-y-2">
          {goldPerks.map((perk, idx) => (
            <View key={idx} className="flex-row items-center">
              <View className="w-5 h-5 rounded-full bg-emerald-100 items-center justify-center mr-2.5">
                <Ionicons name="checkmark-sharp" size={12} color="#16a34a" />
              </View>
              <Text className="text-xs font-medium text-slate-700 flex-1">{perk}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
