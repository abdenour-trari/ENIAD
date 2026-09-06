import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASSETS } from '@/assets';

interface ActionCardsProps {
  onCreateGroup?: () => void;
  onInviteFriends?: () => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  onCreateGroup,
  onInviteFriends,
}) => {
  return (
    <View className="flex-row px-4 pt-6 pb-4" style={{ gap: 16 }}>
      {/* Create Group Card */}
      <Pressable
        onPress={onCreateGroup}
        className="flex-1 rounded-[28px] overflow-hidden p-5 justify-between"
        style={{ backgroundColor: '#5135C5', minHeight: 294 }}
      >
        <View>
          <Text className="text-white text-[25px] font-extrabold" style={{ lineHeight: 32 }}>
            Créer un{'\n'}groupe
          </Text>
          <Text className="text-white text-sm font-medium mt-2" style={{ lineHeight: 21 }}>
            Invite tes amis et{'\n'}économisez ensemble !
          </Text>
        </View>

        <View className="flex-row items-end justify-between mt-2">
          <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
            <Ionicons name="arrow-forward" size={29} color="#5135C5" />
          </View>
          <Image
            source={ASSETS.createGroup3d}
            style={{ width: 138, height: 125, marginRight: -34, marginBottom: -20 }}
            resizeMode="contain"
          />
        </View>

        {/* Group Icon Top Right */}
        <View className="absolute top-5 right-5 w-14 h-14 rounded-full bg-white items-center justify-center">
          <Ionicons name="people" size={29} color="#6D43DC" />
        </View>
      </Pressable>

      {/* Invite Friends Card */}
      <Pressable
        onPress={onInviteFriends}
        className="flex-1 rounded-[28px] overflow-hidden p-5 justify-between"
        style={{ backgroundColor: '#FA3E5E', minHeight: 294 }}
      >
        <View>
          <Text className="text-white text-lg font-extrabold leading-6">
            Inviter des{'\n'}amis
          </Text>
          <Text className="text-white/80 text-xs font-medium mt-1.5 leading-4">
            Plus vous êtes nombreux,{'\n'}plus vous économisez !
          </Text>
        </View>

        <View className="flex-row items-end justify-between mt-2">
          <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
            <Ionicons name="arrow-forward" size={29} color="#FA3E5E" />
          </View>
          <Image
            source={ASSETS.inviteFriends3d}
            style={{ width: 140, height: 130, marginRight: -36, marginBottom: -20 }}
            resizeMode="contain"
          />
        </View>

        {/* People Icon Top Right */}
        <View className="absolute top-5 right-5 w-14 h-14 rounded-full bg-white items-center justify-center">
          <Ionicons name="people" size={29} color="#FA3E5E" />
        </View>
      </Pressable>
    </View>
  );
};
