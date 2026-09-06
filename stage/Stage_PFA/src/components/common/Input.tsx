import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface InputProps extends TextInputProps {
  iconName: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  iconName,
  isPassword = false,
  error,
  rightElement,
  secureTextEntry,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View className="mb-3.5 w-full">
      <View
        className={`flex-row items-center border rounded-2xl px-4 py-3 bg-white ${
          error ? 'border-red-500' : 'border-slate-200'
        }`}
      >
        <Ionicons name={iconName} size={20} color={COLORS.primary[600]} style={{ marginRight: 10 }} />
        <TextInput
          className="flex-1 text-base text-gray-900 font-regular"
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6b7280"
            />
          </Pressable>
        )}
        {rightElement && !isPassword && rightElement}
      </View>
      {error && <Text className="text-xs text-red-500 mt-1 ml-2 font-medium">{error}</Text>}
    </View>
  );
};
