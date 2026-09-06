import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'social';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap | React.ReactElement;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  className = '',
}) => {
  if (variant === 'social') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        className={`flex-1 flex-row items-center justify-center py-3 px-3 rounded-2xl border border-slate-200 bg-white shadow-sm active:bg-slate-50 mx-1 ${className}`}
      >
        {typeof icon === 'string' ? (
          <Ionicons name={icon as any} size={18} color="#111827" style={{ marginRight: 6 }} />
        ) : (
          icon ? <View className="mr-1.5">{icon}</View> : null
        )}
        <Text className="text-sm font-semibold text-gray-800">{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full py-4 rounded-2xl items-center justify-center bg-primary active:bg-primary-700 shadow-sm ${
        disabled ? 'opacity-60' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-base font-bold text-white tracking-wide">{title}</Text>
      )}
    </Pressable>
  );
};
