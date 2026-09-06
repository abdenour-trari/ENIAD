import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '@/constants/colors';
import { OfflineBanner } from '@/components';
import { useNetworkStore } from '@/store';
import '../global.css';

SplashScreen.preventAutoHideAsync();

/**
 * Root Navigation Stack configuration for Jiblina.
 * Contains Bottom Tabs, Auth group, and all Stack Screens.
 * Mounts global OfflineBanner and starts NetInfo connectivity listener.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Start NetInfo connectivity listener on app mount
  useEffect(() => {
    const unsubscribe = useNetworkStore.getState().startListening();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.primary[600]} />

      {/* Global Offline Mode Banner */}
      <OfflineBanner />

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
        {/* Main App Tabs & Auth */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Stack Screens */}
        <Stack.Screen name="restaurant/[id]" options={{ title: 'Restaurant' }} />
        <Stack.Screen name="payment" options={{ title: 'Paiement' }} />
        <Stack.Screen name="tracking" options={{ title: 'Suivi de Commande' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="settings" options={{ title: 'Paramètres' }} />
        <Stack.Screen name="loyalty" options={{ title: 'Fidélité' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Modifier le profil' }} />
        <Stack.Screen name="cart" options={{ title: 'Mon Panier', presentation: 'modal' }} />
        <Stack.Screen name="group-order" options={{ title: 'Commande Collective' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

