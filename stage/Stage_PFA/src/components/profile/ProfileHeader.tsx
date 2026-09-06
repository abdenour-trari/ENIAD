import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileDataType } from '@/services/dataService';

interface ProfileHeaderProps {
  user: ProfileDataType['user'];
  level: ProfileDataType['level'];
  onEditAvatar?: () => void;
  onViewPerks?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  level,
  onEditAvatar,
  onViewPerks,
}) => {
  const levelPercent = Math.min((level.currentPoints / level.targetPoints) * 100, 100);

  return (
    <View className="bg-white pb-4 mb-3">
      {/* Avatar & User Details */}
      <View className="items-center pt-2 pb-5">
        {/* Avatar with Camera Icon */}
        <View className="relative mb-3">
          <View className="w-24 h-24 rounded-full border-4 border-emerald-500 p-1 shadow-md overflow-hidden bg-white">
            <Image
              source={{ uri: user.avatar }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          </View>

          <Pressable
            onPress={onEditAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center"
          >
            <Ionicons name="camera" size={16} color="#16a34a" />
          </Pressable>
        </View>

        {/* Name */}
        <Text className="text-2xl font-extrabold text-slate-900 mb-1">
          {user.name}
        </Text>

        {/* Student Badge */}
        <View className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex-row items-center mb-2">
          <Text className="text-xs font-bold text-emerald-800">
            🎓 {user.badge}
          </Text>
        </View>

        {/* Contact info */}
        <Text className="text-xs font-medium text-slate-500 mb-0.5">{user.email}</Text>
        <Text className="text-xs font-medium text-slate-500">{user.phone}</Text>
      </View>

      {/* Gold Level Banner */}
      <View className="mx-5 bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 shadow-2xs">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center">
            <Text className="text-lg mr-1.5">👑</Text>
            <Text className="text-sm font-extrabold text-amber-900">
              Niveau {level.currentLevel}
            </Text>
          </View>

          <Pressable onPress={onViewPerks} className="flex-row items-center">
            <Text className="text-xs font-semibold text-amber-800 mr-0.5">
              Voir mes avantages
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#92400e" />
          </Pressable>
        </View>

        <Text className="text-xs text-amber-700 font-medium mb-3">
          {level.subtitle}
        </Text>

        {/* Progress Bar */}
        <View className="w-full h-2 rounded-full bg-amber-200/80 overflow-hidden mb-1.5">
          <View
            className="h-full bg-amber-500 rounded-full"
            style={{ width: `${levelPercent}%` }}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-[11px] font-bold text-amber-900">
            {level.currentPoints.toLocaleString()} / {level.targetPoints.toLocaleString()} pts
          </Text>
          <Text className="text-[11px] font-semibold text-amber-800">
            Niveau {level.nextLevel}
          </Text>
        </View>
      </View>
    </View>
  );
};
