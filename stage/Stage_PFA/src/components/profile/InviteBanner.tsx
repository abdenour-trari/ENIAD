import React from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { ASSETS } from '@/assets';

interface InviteBannerProps {
  onInvitePress?: () => void;
}

export const InviteBanner: React.FC<InviteBannerProps> = ({ onInvitePress }) => {
  const handleInvite = () => {
    if (onInvitePress) {
      onInvitePress();
    } else {
      Alert.alert(
        'Lien d\'invitation',
        'Lien d\'invitation copié ! Partagez-le avec vos amis pour gagner +100 points.'
      );
    }
  };

  return (
    <View className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex-row items-center justify-between shadow-2xs mb-6">
      <View className="flex-1 mr-3">
        <Text className="text-xs font-bold text-emerald-950 mb-0.5">
          Invite tes amis et gagne{' '}
          <Text className="text-primary font-extrabold">100 points</Text>
        </Text>
        <Text className="text-[11px] text-emerald-700 font-medium leading-4 mb-3">
          chaque fois qu'ils passent leur première commande !
        </Text>

        <Pressable
          onPress={handleInvite}
          className="bg-primary active:bg-primary-700 px-4 py-2.5 rounded-xl self-start shadow-xs"
        >
          <Text className="text-xs font-bold text-white">Inviter maintenant</Text>
        </Pressable>
      </View>

      <Image
        source={ASSETS.giftBox}
        className="w-24 h-24"
        resizeMode="contain"
      />
    </View>
  );
};
