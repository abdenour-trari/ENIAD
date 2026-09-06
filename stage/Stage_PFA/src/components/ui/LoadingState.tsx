import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  size?: 'small' | 'large';
  color?: string;
  containerClassName?: string;
}

/**
 * Standardized LoadingState Component.
 * Fully configurable with custom spinner size, color, message, and submessage.
 * NativeWind styled matching Jiblina design system.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement en cours...',
  submessage,
  size = 'large',
  color = '#16a34a',
  containerClassName = 'flex-1 items-center justify-center p-6 bg-background-offWhite',
}) => {
  return (
    <View className={containerClassName}>
      <View className="w-14 h-14 rounded-3xl bg-emerald-50 border border-emerald-200 items-center justify-center mb-4 shadow-2xs">
        <ActivityIndicator size={size} color={color} />
      </View>

      {message && (
        <Text className="text-sm font-extrabold text-slate-800 text-center mb-0.5">
          {message}
        </Text>
      )}

      {submessage && (
        <Text className="text-xs text-slate-400 font-medium text-center">
          {submessage}
        </Text>
      )}
    </View>
  );
};

export default LoadingState;
