import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiscountProgressProps {
  membersJoined: number;
  maxMembers: number;
  missingMembersCount: number;
}

export const DiscountProgress: React.FC<DiscountProgressProps> = ({
  membersJoined,
  maxMembers,
  missingMembersCount,
}) => {
  const progressPercent = Math.min((membersJoined / maxMembers) * 100, 100);

  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
      {/* Header Title */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-slate-900">Progression du groupe</Text>
        <Text className="text-xs font-semibold text-slate-600">
          <Text className="text-primary font-bold">{membersJoined}</Text> / {maxMembers} participants
        </Text>
      </View>

      {/* Circle Status Nodes Bar (8 nodes) */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        {Array.from({ length: maxMembers }).map((_, index) => {
          const isJoined = index < membersJoined;
          return (
            <View
              key={index}
              className={`w-7 h-7 rounded-full items-center justify-center border ${
                isJoined
                  ? 'bg-primary border-primary'
                  : 'bg-slate-50 border-dashed border-slate-300'
              }`}
            >
              {isJoined ? (
                <Ionicons name="person" size={13} color="#ffffff" />
              ) : (
                <Ionicons name="add" size={14} color="#94a3b8" />
              )}
            </View>
          );
        })}
      </View>

      {/* Progress Bar */}
      <View className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-2 border border-slate-200/60">
        <View
          className="h-full bg-emerald-600 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/* Subtitle */}
      <Text className="text-xs font-medium text-slate-600">
        Il manque <Text className="font-bold text-slate-900">{missingMembersCount} personnes</Text> pour débloquer la réduction !
      </Text>
    </View>
  );
};
