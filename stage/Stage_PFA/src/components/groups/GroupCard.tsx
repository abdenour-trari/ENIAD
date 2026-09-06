import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupOrderType } from '@/services/dataService';
import { ASSETS } from '@/assets';

interface GroupCardProps {
  group: GroupOrderType;
  onJoin: (id: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin }) => {
  const getCoverImage = () => {
    if (group.restaurantId === 'kfc') return ASSETS.burgerCover;
    if (group.restaurantId === 'snack-story') return ASSETS.promoBanner;
    return ASSETS.pizzaCover;
  };

  const progressPercent = Math.min((group.membersJoined / group.maxMembers) * 100, 100);

  return (
    <View className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs mb-4">
      <View className="flex-row p-3">
        {/* Cover Photo */}
        <View className="w-24 h-24 rounded-xl overflow-hidden mr-3 bg-slate-100 relative">
          <Image
            source={getCoverImage()}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Members Badge Overlay */}
          <View className="absolute top-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded-full flex-row items-center">
            <Ionicons name="people" size={10} color="#22c55e" style={{ marginRight: 2 }} />
            <Text className="text-[10px] font-bold text-white">
              {group.membersJoined}/{group.maxMembers}
            </Text>
          </View>
        </View>

        {/* Info Content */}
        <View className="flex-1 justify-between">
          <View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                {group.restaurantName}
              </Text>

              {/* Discount Badge */}
              <View className="bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                <Text className="text-[10px] font-extrabold text-orange-600">
                  -{group.discountPercentage}%
                </Text>
              </View>
            </View>

            <Text className="text-xs font-medium text-slate-500 mb-1">
              📍 {group.locationText}
            </Text>

            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={13} color="#ea580c" style={{ marginRight: 4 }} />
              <Text className="text-xs font-semibold text-orange-600">
                {group.deliveryTimeText}
              </Text>
            </View>
          </View>

          {/* Avatars & Creator Subtitle */}
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-2">
                {group.avatars.map((url, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: url }}
                    className="w-6 h-6 rounded-full border border-white -ml-1.5"
                  />
                ))}
                {group.extraAvatarsCount > 0 && (
                  <View className="w-6 h-6 rounded-full bg-slate-800 border border-white items-center justify-center -ml-1.5">
                    <Text className="text-[8px] font-bold text-white">
                      +{group.extraAvatarsCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Join Button */}
            <Pressable
              onPress={() => onJoin(group.id)}
              className="bg-primary active:bg-primary-700 px-4 py-2 rounded-xl shadow-xs"
            >
              <Text className="text-xs font-bold text-white">Rejoindre</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Progress Footer */}
      <View className="bg-slate-50 px-4 py-2 border-t border-slate-100">
        <Text className="text-[11px] font-medium text-slate-600 mb-1">
          {group.creatorName} a créé ce groupe • Il manque{' '}
          <Text className="font-bold text-slate-900">{group.missingMembersCount} personnes</Text>{' '}
          pour débloquer la réduction !
        </Text>
        <View className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <View
            className="h-full bg-emerald-600 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>
    </View>
  );
};
