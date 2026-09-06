import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

/**
 * Authentication Stack Layout.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary[600],
        },
        headerTintColor: COLORS.background.surface,
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 18,
        },
        contentStyle: {
          backgroundColor: COLORS.background.offWhite,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Authentification',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Connexion',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Inscription',
        }}
      />
    </Stack>
  );
}
