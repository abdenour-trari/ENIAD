import React from 'react';
import { View, Text } from 'react-native';

/**
 * Stack Route: Modifier Profil Screen Shell.
 */
export default function EditProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-background-offWhite">
      <Text className="text-xl font-semibold text-primary mb-2">Écran Modifier Profil</Text>
      <Text className="text-sm text-textSecondary text-center">
        Route: /edit-profile
      </Text>
    </View>
  );
}
