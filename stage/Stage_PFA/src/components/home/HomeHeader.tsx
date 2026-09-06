import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ASSETS } from '@/assets';

interface HomeHeaderProps {
  userName: string;
  locationName: string;
  notificationsCount: number;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  locationName,
  notificationsCount,
  onLocationPress,
  onNotificationPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 12) + 4, backgroundColor: '#FFD54A', borderBottomLeftRadius: 42, borderBottomRightRadius: 42 }}
      className="px-5 pb-7 overflow-hidden"
    >
      {/* Top Row: Greeting + Location + Bell */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-slate-800">
          Salut {userName} ! 👋
        </Text>

        <View className="flex-row items-center space-x-2">
          {/* Location Pill */}
          <Pressable
            onPress={onLocationPress}
            className="flex-row items-center bg-white px-4 py-3 rounded-full shadow-sm"
          >
            <Ionicons name="location" size={17} color="#F6B800" style={{ marginRight: 5 }} />
            <Text className="text-sm font-bold text-slate-800 mr-1">{locationName}</Text>
            <Ionicons name="chevron-down" size={16} color="#F6B800" />
          </Pressable>

          {/* Notification Bell */}
          <Pressable
            onPress={onNotificationPress}
            className="w-11 h-11 items-center justify-center ml-2 relative"
          >
            <Ionicons name="notifications-outline" size={30} color="#111827" />
            {notificationsCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 w-4.5 h-4.5 rounded-full items-center justify-center border-2 border-white"
                style={{ width: 18, height: 18 }}
              >
                <Text className="text-white font-bold" style={{ fontSize: 9 }}>
                  {notificationsCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Title + Hero Burger Row */}
      <View className="flex-row items-end justify-between" style={{ minHeight: 156 }}>
        {/* Left: Title Text */}
        <View className="flex-1 pr-1 pb-2" style={{ zIndex: 2 }}>
          <Text className="text-[29px] font-extrabold text-slate-900" style={{ lineHeight: 38 }}>
            Qu'est-ce qui te{'\n'}fait plaisir{'\n'}aujourd'hui ?
          </Text>
        </View>

        {/* Right: Hero Burger Image */}
        <View style={{ width: 182, height: 145, marginRight: -25 }}>
          <Image
            source={ASSETS.heroBurger}
            style={{ width: 182, height: 145 }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};
