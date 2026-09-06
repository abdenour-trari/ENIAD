import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupOrderType } from '@/services/dataService';

interface GroupOrderPreviewProps {
  group: GroupOrderType;
  deepLinkUrl: string;
  onShare: () => void;
  onCopyLink: () => void;
  onJoinGroup: () => void;
  copied?: boolean;
}

/**
 * Preview Component for Group Order Invitations received via Deep Linking (jiblina://group-order/[id]).
 * Displays enrolled participants, preview of current ordered items, and deep link sharing actions.
 */
export const GroupOrderPreview: React.FC<GroupOrderPreviewProps> = ({
  group,
  deepLinkUrl,
  onShare,
  onCopyLink,
  onJoinGroup,
  copied = false,
}) => {
  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl mb-6">
      {/* Header Banner */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center border border-emerald-200">
            <Ionicons name="people" size={16} color="#16a34a" />
          </View>
          <View>
            <Text className="text-xs font-bold text-slate-900 ml-2">
              Aperçu du groupe
            </Text>
            <Text className="text-[10px] font-medium text-slate-500 ml-2">
              Lien: {deepLinkUrl}
            </Text>
          </View>
        </View>

        <View className="bg-emerald-600 px-2.5 py-1 rounded-lg">
          <Text className="text-[10px] font-extrabold text-white">
            -{group.discountPercentage}%
          </Text>
        </View>
      </View>

      {/* Restaurant Overview */}
      <View className="flex-row items-center bg-slate-50 p-3 rounded-2xl border border-slate-200/80 mb-4">
        <Image
          source={{ uri: group.restaurantLogo }}
          className="w-12 h-12 rounded-xl mr-3 bg-white border border-slate-200"
          resizeMode="contain"
        />
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{group.restaurantName}</Text>
          <Text className="text-xs text-slate-500">{group.locationText}</Text>
          <Text className="text-[11px] font-semibold text-emerald-700 mt-0.5">
            ⏱ Livré vers {group.deliveryTimeText}
          </Text>
        </View>
      </View>

      {/* Enrolled Participants List */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2.5">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Participants inscrits ({group.membersJoined}/{group.maxMembers})
          </Text>
          <Text className="text-xs font-bold text-emerald-600">
            {group.missingMembersCount === 0
              ? 'Groupe complet ! 🎉'
              : `Encore ${group.missingMembersCount} place(s)`}
          </Text>
        </View>

        {/* Member Avatars Row */}
        <View className="flex-row items-center flex-wrap gap-2 mb-3">
          {group.members.map((member) => (
            <View
              key={member.id}
              className="flex-row items-center bg-white border border-slate-200 px-2.5 py-1.5 rounded-full shadow-2xs"
            >
              <Image
                source={{ uri: member.avatar }}
                className="w-6 h-6 rounded-full mr-1.5 border border-slate-200"
              />
              <Text className="text-xs font-semibold text-slate-800 mr-1">{member.name}</Text>
              {(member.isCreator || member.role === 'Créateur') && (
                <View className="bg-orange-500 px-1.5 py-0.5 rounded-full">
                  <Text className="text-[9px] font-bold text-white">Hôte</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Current Ordered Items Preview */}
      <View className="mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Plats déjà commandés dans le groupe
        </Text>

        {group.orderedFoods.map((foodItem, idx) => (
          <View key={idx} className="flex-row items-center justify-between py-1.5 border-b border-slate-200/50 last:border-b-0">
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                {foodItem.name}
              </Text>
              <Text className="text-[10px] font-medium text-slate-500">
                Ajouté par {(foodItem as any).addedBy || 'Membre'} • Qte: {foodItem.quantity}
              </Text>
            </View>
            <Text className="text-xs font-extrabold text-emerald-700">
              {foodItem.unitPrice} DH
            </Text>
          </View>
        ))}
      </View>


      {/* Action Buttons */}
      <View className="space-y-2">
        {/* Deep Link Share Button */}
        <Pressable
          onPress={onShare}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center flex-row shadow-md mb-2"
        >
          <Ionicons name="share-social-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text className="text-xs font-extrabold text-white">
            Partager l'invitation 🔗
          </Text>
        </Pressable>

        {/* Join Group Button */}
        <Pressable
          onPress={onJoinGroup}
          className="w-full py-3 rounded-2xl bg-slate-900 active:bg-slate-800 items-center justify-center flex-row shadow-xs mb-2"
        >
          <Ionicons name="people-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text className="text-xs font-bold text-white">
            Rejoindre cette commande 👥
          </Text>
        </Pressable>

        {/* Copy Link Action */}
        <Pressable
          onPress={onCopyLink}
          className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 items-center justify-center flex-row active:bg-slate-100"
        >
          <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={15} color={copied ? "#16a34a" : "#64748b"} style={{ marginRight: 6 }} />
          <Text className="text-xs font-bold text-slate-700">
            {copied ? 'Lien copié dans le presse-papier !' : 'Copier le lien (jiblina://...)'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default GroupOrderPreview;
