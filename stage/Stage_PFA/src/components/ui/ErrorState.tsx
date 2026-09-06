import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  retryText?: string;
  onRetry?: () => void;
  containerClassName?: string;
}

/**
 * Standardized ErrorState Component.
 * Fully configurable with title, description, warning/error icon, and optional retry action CTA.
 * NativeWind styled matching Jiblina design system.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Une erreur est survenue',
  description = 'Impossible de charger les données. Veuillez vérifier votre connexion internet et réessayez.',
  iconName = 'alert-circle-outline',
  retryText = 'Réessayer',
  onRetry,
  containerClassName = 'flex-1 items-center justify-center p-6 bg-background-offWhite',
}) => {
  return (
    <View className={containerClassName}>
      {/* Icon Badge */}
      <View className="w-16 h-16 rounded-3xl bg-red-100 items-center justify-center mb-4 border border-red-200 shadow-2xs">
        <Ionicons name={iconName} size={32} color="#dc2626" />
      </View>

      {/* Title */}
      <Text className="text-lg font-extrabold text-slate-900 text-center mb-1">
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text className="text-xs text-slate-500 font-medium text-center leading-5 mb-5 max-w-[280px]">
          {description}
        </Text>
      )}

      {/* Optional Retry Action CTA */}
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-red-600 active:bg-red-700 px-6 py-3 rounded-2xl shadow-xs flex-row items-center space-x-2"
        >
          <Ionicons name="refresh-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
          <Text className="text-xs font-bold text-white">{retryText}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default ErrorState;
