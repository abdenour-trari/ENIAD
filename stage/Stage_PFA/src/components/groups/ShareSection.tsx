import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareSectionProps {
  shareUrl: string;
  onCopyLink: () => void;
  onShareWhatsApp?: () => void;
  onShareInstagram?: () => void;
  onShareMore?: () => void;
}

export const ShareSection: React.FC<ShareSectionProps> = ({
  shareUrl,
  onCopyLink,
  onShareWhatsApp,
  onShareInstagram,
  onShareMore,
}) => {
  return (
    <View className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs mb-4">
      {/* Title */}
      <Text className="text-sm font-bold text-slate-900 mb-0.5">
        Partage le lien avec tes amis
      </Text>
      <Text className="text-xs text-slate-500 mb-3">
        Plus vous êtes nombreux, plus la réduction est grande.
      </Text>

      {/* Copy Link Input Box */}
      <View className="flex-row items-center bg-white border border-slate-200 rounded-xl p-2.5 mb-3 shadow-2xs">
        <Text className="flex-1 text-xs font-semibold text-slate-700 mr-2" numberOfLines={1}>
          {shareUrl}
        </Text>
        <Pressable
          onPress={onCopyLink}
          className="bg-primary active:bg-primary-700 p-2 rounded-lg items-center justify-center"
        >
          <Ionicons name="copy-outline" size={16} color="#ffffff" />
        </Pressable>
      </View>

      {/* Social Buttons */}
      <View className="flex-row items-center justify-between space-x-2">
        <Pressable
          onPress={onShareWhatsApp || (() => Alert.alert('WhatsApp', 'Partage sur WhatsApp'))}
          className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 py-2.5 rounded-xl mr-1 shadow-2xs"
        >
          <Ionicons name="logo-whatsapp" size={16} color="#25D366" style={{ marginRight: 6 }} />
          <Text className="text-xs font-bold text-slate-800">WhatsApp</Text>
        </Pressable>

        <Pressable
          onPress={onShareInstagram || (() => Alert.alert('Instagram', 'Partage sur Instagram'))}
          className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 py-2.5 rounded-xl mx-1 shadow-2xs"
        >
          <Ionicons name="logo-instagram" size={16} color="#E4405F" style={{ marginRight: 6 }} />
          <Text className="text-xs font-bold text-slate-800">Instagram</Text>
        </Pressable>

        <Pressable
          onPress={onShareMore || (() => Alert.alert('Partager', 'Autres options de partage'))}
          className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 py-2.5 rounded-xl ml-1 shadow-2xs"
        >
          <Ionicons name="ellipsis-horizontal" size={16} color="#475569" style={{ marginRight: 4 }} />
          <Text className="text-xs font-bold text-slate-800">Plus</Text>
        </Pressable>
      </View>
    </View>
  );
};
