import React from 'react';
import { View, Text } from 'react-native';

/**
 * Route Tab: Commandes Screen Shell.
 */
export default function OrdersScreen() {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-background-offWhite">
      <Text className="text-xl font-semibold text-primary mb-2">Écran Commandes</Text>
      <Text className="text-sm text-textSecondary text-center">
        Route: /(tabs)/orders
      </Text>
    </View>
  );
}
