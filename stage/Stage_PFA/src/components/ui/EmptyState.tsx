import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateProps {
  title: string;
  description?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  imageUri?: string;
  ctaText?: string;
  onCtaPress?: () => void;
  containerClassName?: string;
}

/**
 * Standardized EmptyState Component.
 * Fully configurable with title, description, icon/image, and optional action CTA button.
 * NativeWind styled matching Jiblina design system.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  iconName = 'search-outline',
  imageUri,
  ctaText,
  onCtaPress,
  containerClassName = 'flex-1 items-center justify-center p-6 bg-background-offWhite',
}) => {
  return (
    <View className={containerClassName}>
      {/* Icon or Image Container */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
      ) : (
        <View className="w-16 h-16 rounded-3xl bg-slate-100 items-center justify-center mb-4 border border-slate-200 shadow-2xs">
          <Ionicons name={iconName} size={32} color="#64748b" />
        </View>
      )}

      {/* Title */}
      <Text className="text-lg font-extrabold text-slate-900 text-center mb-1">
        {title}
      </Text>

      {/* Optional Description */}
      {description && (
        <Text className="text-xs text-slate-500 font-medium text-center leading-5 mb-5 max-w-[260px]">
          {description}
        </Text>
      )}

      {/* Optional Action CTA Button */}
      {ctaText && onCtaPress && (
        <Pressable
          onPress={onCtaPress}
          className="bg-primary active:bg-primary-700 px-6 py-3.5 rounded-2xl shadow-xs flex-row items-center space-x-2"
        >
          <Text className="text-xs font-bold text-white mr-1">{ctaText}</Text>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
        </Pressable>
      )}
    </View>
  );
};

export default EmptyState;
