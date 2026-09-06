import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RestaurantDetailType } from '@/services/dataService';

interface RestaurantHeaderProps {
  restaurant: RestaurantDetailType;
  onBackPress: () => void;
  onFavoritePress?: () => void;
  onSharePress?: () => void;
  onGroupOrderPress?: () => void;
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  restaurant,
  onBackPress,
  onFavoritePress,
  onSharePress,
  onGroupOrderPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-white">
      {/* Cover Image Container */}
      <View className="h-48 w-full relative">
        <Image
          source={{ uri: restaurant.coverUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Top Floating Actions Bar */}
        <View
          style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
          className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between"
        >
          {/* Back Button */}
          <Pressable
            onPress={onBackPress}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-md border border-slate-200"
          >
            <Ionicons name="chevron-back" size={20} color="#1e293b" />
          </Pressable>

          {/* Right Action Buttons */}
          <View className="flex-row items-center space-x-2">
            <Pressable
              onPress={onFavoritePress}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-md border border-slate-200"
            >
              <Ionicons name="heart-outline" size={20} color="#ef4444" />
            </Pressable>
            <Pressable
              onPress={onSharePress}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-md border border-slate-200 ml-2"
            >
              <Ionicons name="share-outline" size={20} color="#1e293b" />
            </Pressable>
          </View>
        </View>

        {/* Status Badge */}
        <View className="absolute bottom-3 right-4 bg-[#eaf4eb] px-3 py-1 rounded-full border border-green-200">
          <Text className="text-xs font-bold text-green-700">{restaurant.status}</Text>
        </View>

        {/* Floating Circular Logo */}
        <View className="absolute -bottom-7 left-5 w-20 h-20 rounded-full bg-white border-2 border-white shadow-lg items-center justify-center overflow-hidden">
          <Image
            source={{ uri: restaurant.logoUrl }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Main Info Section */}
      <View className="pt-9 px-5 pb-4">
        {/* Title & Verified Checkmark */}
        <View className="flex-row items-center mb-1">
          <Text className="text-2xl font-bold text-slate-900 mr-2">
            {restaurant.name}
          </Text>
          {restaurant.isVerified && (
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
          )}
        </View>

        {/* Subcategories */}
        <Text className="text-xs font-medium text-slate-500 mb-3">
          {restaurant.categories.join(' • ')}
        </Text>

        {/* Meta Pills (Rating, Delivery Time, Distance, Price Level) */}
        <View className="flex-row items-center space-x-3 mb-4 flex-wrap">
          <View className="flex-row items-center mr-3 mb-1">
            <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 3 }} />
            <Text className="text-xs font-bold text-slate-800">
              {restaurant.rating}
            </Text>
            <Text className="text-xs text-slate-500 ml-1">
              ({restaurant.totalReviews} avis)
            </Text>
          </View>

          <View className="flex-row items-center mr-3 mb-1">
            <Ionicons name="time-outline" size={14} color="#64748b" style={{ marginRight: 3 }} />
            <Text className="text-xs font-semibold text-slate-700">
              {restaurant.deliveryTime}
            </Text>
          </View>

          <View className="flex-row items-center mr-3 mb-1">
            <Ionicons name="location-outline" size={14} color="#64748b" style={{ marginRight: 3 }} />
            <Text className="text-xs font-semibold text-slate-700">
              {restaurant.distance}
            </Text>
          </View>

          <Text className="text-xs font-bold text-slate-600 mb-1">
            {restaurant.priceLevel}
          </Text>
        </View>

        {/* Collective Order Green Banner */}
        <Pressable
          onPress={onGroupOrderPress}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex-row items-center justify-between shadow-2xs mb-4 active:bg-emerald-100/80"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-3 border border-emerald-300">
              <Ionicons name="pricetag-outline" size={16} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-emerald-900">
                {restaurant.groupOrderDiscountText}
              </Text>
              <Text className="text-[11px] font-medium text-emerald-700">
                {restaurant.groupOrderValidUntil}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#16a34a" />
        </Pressable>

        {/* À propos (About Section) */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-base font-bold text-slate-900">À propos</Text>
            <Pressable className="flex-row items-center">
              <Text className="text-xs font-semibold text-primary mr-0.5">Voir plus</Text>
              <Ionicons name="chevron-down" size={14} color="#16a34a" />
            </Pressable>
          </View>
          <Text className="text-xs text-slate-600 leading-5 mb-4">
            {restaurant.aboutText}
          </Text>

          {/* 4 Info Pills */}
          <View className="flex-row justify-between bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
            {restaurant.infoPills.map((pill, index) => (
              <View key={index} className="items-center flex-1">
                <Ionicons name={pill.icon as any} size={18} color="#475569" style={{ marginBottom: 4 }} />
                <Text className="text-[10px] text-slate-500 font-medium text-center">
                  {pill.label}
                </Text>
                <Text className="text-xs font-bold text-slate-800 text-center mt-0.5" numberOfLines={1}>
                  {pill.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
