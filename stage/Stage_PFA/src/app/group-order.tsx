import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, GroupOrderType } from '@/services/dataService';
import {
  DiscountProgress,
  ShareSection,
  MemberSection,
  FoodSummarySection,
  GroupOrderPreview,
  GroupPaymentSplitModal,
  GroupSplitCalculation,
} from '@/components';
import { generateGroupOrderDeepLink, shareGroupOrderInvitation } from '@/utils/deepLinking';
import { useGroupOrderStore } from '@/store';

/**
 * Pixel-Perfect Group Order Detail & Preview Screen.
 * Features:
 * - Payment Split calculation modal (Equal Split vs Itemized Dish Split) validated with Zod Schema
 * - Real-time participant status polling ("n'a pas encore rejoint", "en train de choisir", "a validé sa commande")
 * - Expo Router Deep Linking (jiblina://group-order/[groupId])
 * - Native system sharing via shareGroupOrderInvitation
 * - Preview screen showing enrolled members & live view of their current ordered items
 * - Discount progress & sticky checkout bar
 */
export default function GroupOrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { groupId, preview } = useLocalSearchParams<{ groupId?: string; preview?: string }>();

  const [group, setGroup] = useState<GroupOrderType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSplitModalVisible, setIsSplitModalVisible] = useState<boolean>(false);

  // Real-time Group Order Zustand Store with Polling
  const { startPolling, stopPolling, isPolling } = useGroupOrderStore();

  useEffect(() => {
    const targetId = groupId || 'g_pizzahut_1';

    // Start real-time status polling (4 seconds interval)
    startPolling(targetId, 4000);

    async function loadGroupData() {
      try {
        const res = await dataService.getGroupOrderById(targetId);
        if (res.data) {
          setGroup(res.data);
        }
      } catch (error) {
        console.error('Error loading group order detail:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGroupData();

    return () => {
      stopPolling();
    };
  }, [groupId]);

  const deepLinkUrl = generateGroupOrderDeepLink(group?.id || groupId || 'g_pizzahut_1');

  const handleShareDeepLink = async () => {
    if (!group) return;
    await shareGroupOrderInvitation(group.id, group.restaurantName, group.discountPercentage);
  };

  const handleCopyLink = () => {
    setCopied(true);
    Alert.alert('Lien d’invitation copié ! 🔗', deepLinkUrl);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinGroup = () => {
    Alert.alert(
      'Bienvenue dans le groupe ! 🎉',
      `Vous avez rejoint la commande chez ${group?.restaurantName}. Vous pouvez maintenant sélectionner vos plats.`
    );
    router.push({ pathname: '/restaurant/[id]', params: { id: 'pizza-hut' } });
  };

  const handleConfirmSplit = (calculation: GroupSplitCalculation) => {
    setIsSplitModalVisible(false);
    const modeLabel = calculation.splitMode === 'EQUAL' ? 'Répartition égale' : 'Par article commandé';

    Alert.alert(
      'Répartition validée par Zod ! 🎉',
      `Mode : ${modeLabel}\nTotal réparti : ${calculation.calculatedSum} DH.\n(Chaque membre recevra son récapitulatif).`,
      [
        {
          text: 'Payer ma part',
          onPress: () =>
            router.push({
              pathname: '/payment',
              params: { splitMode: calculation.splitMode },
            }),
        },
      ]
    );
  };

  if (loading || !group) {
    return (
      <View className="flex-1 items-center justify-center bg-background-offWhite">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-offWhite relative">
      {/* Custom Top Navigation Bar */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
        className="px-4 pb-3 bg-white border-b border-slate-200/80 flex-row items-center justify-between z-10"
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center border border-slate-200"
        >
          <Ionicons name="chevron-back" size={20} color="#1e293b" />
        </Pressable>

        <View className="items-center">
          <Text className="text-base font-bold text-slate-900">Commande collective</Text>
          <Text className="text-[10px] font-semibold text-emerald-600">
            jiblina://group-order/{group.id}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={handleShareDeepLink}
            className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center mr-1 shadow-2xs"
          >
            <Ionicons name="share-social" size={18} color="#16a34a" />
          </Pressable>

          <Pressable
            onPress={handleCopyLink}
            className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center border border-slate-200"
          >
            <Ionicons name="copy-outline" size={17} color="#1e293b" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4 pb-32">
        {/* Real-time Status Polling Banner */}
        <View className="flex-row items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl px-3.5 py-2 mb-3">
          <View className="flex-row items-center space-x-1.5">
            <Ionicons name="radio-outline" size={14} color="#16a34a" />
            <Text className="text-xs font-bold text-emerald-800 ml-1">
              En direct • Suivi des statuts participants
            </Text>
          </View>
          <View className="bg-emerald-600 px-2 py-0.5 rounded-full flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-white mr-1" />
            <Text className="text-[9px] font-bold text-white uppercase tracking-wider">
              {isPolling ? 'Polling 4s' : 'Actif'}
            </Text>
          </View>
        </View>

        {/* 1. Deep Link Group Preview Component */}
        <GroupOrderPreview
          group={group}
          deepLinkUrl={deepLinkUrl}
          onShare={handleShareDeepLink}
          onCopyLink={handleCopyLink}
          onJoinGroup={handleJoinGroup}
          copied={copied}
        />

        {/* 2. Hero Restaurant Banner */}
        <View className="rounded-2xl overflow-hidden mb-4 border border-slate-200/90 shadow-sm relative bg-slate-900">
          <Image
            source={{ uri: group.coverUrl }}
            className="w-full h-44 opacity-75"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40 p-4 justify-between">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-white border border-white items-center justify-center overflow-hidden mr-3">
                <Image
                  source={{ uri: group.restaurantLogo }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              <View>
                <Text className="text-xl font-extrabold text-white">
                  {group.restaurantName}
                </Text>
                <Text className="text-xs font-medium text-slate-200">
                  {group.locationText}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center bg-black/60 px-3 py-1.5 rounded-full border border-white/20">
                <Ionicons name="time-outline" size={14} color="#f97316" style={{ marginRight: 4 }} />
                <Text className="text-xs font-semibold text-white mr-3">
                  {group.deliveryTimeText}
                </Text>
                <Text className="text-xs font-bold text-emerald-400">
                  ● {group.status}
                </Text>
              </View>

              <View className="bg-orange-500 px-3 py-1.5 rounded-xl border border-orange-400">
                <Text className="text-xs font-extrabold text-white">
                  -{group.discountPercentage}% sur le total
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Progression du groupe Component */}
        <DiscountProgress
          membersJoined={group.membersJoined}
          maxMembers={group.maxMembers}
          missingMembersCount={group.missingMembersCount}
        />

        {/* 4. ShareSection Component */}
        <ShareSection
          shareUrl={deepLinkUrl}
          onCopyLink={handleCopyLink}
          onShareWhatsApp={handleShareDeepLink}
          onShareInstagram={handleShareDeepLink}
          onShareMore={handleShareDeepLink}
        />

        {/* 5. MemberSection Component with Live Status Badges */}
        <MemberSection
          members={group.members as any}
        />

        {/* 6. FoodSummarySection Component */}
        <FoodSummarySection
          foods={group.orderedFoods as any}
          onSeeAllPress={() => Alert.alert('Commandes', 'Tous les plats commandés dans ce groupe')}
        />
      </ScrollView>

      {/* Sticky Bottom Total & Checkout Footer Bar with Split Trigger Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200/90 p-4 shadow-xl z-50">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-xs font-medium text-slate-500">
              Total Groupe ({group.totalItemsCount} articles)
            </Text>
            <View className="flex-row items-baseline space-x-2">
              <Text className="text-xl font-extrabold text-slate-900 mr-2">
                {group.discountedTotal} DH
              </Text>
              <Text className="text-xs text-slate-400 line-through mr-1">
                {group.originalTotal} DH
              </Text>
              <View className="bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                <Text className="text-[10px] font-bold text-orange-600">
                  -{group.discountPercentage}%
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons: Split Payment or View Cart */}
          <View className="flex-row items-center space-x-2">
            <Pressable
              onPress={() => setIsSplitModalVisible(true)}
              className="bg-emerald-50 border border-emerald-200 px-3.5 py-3 rounded-xl flex-row items-center mr-1"
            >
              <Ionicons name="calculator-outline" size={16} color="#16a34a" style={{ marginRight: 4 }} />
              <Text className="text-xs font-extrabold text-emerald-700">Répartir ⚖️</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/cart')}
              className="bg-primary active:bg-primary-700 px-4 py-3 rounded-xl shadow-xs"
            >
              <Text className="text-xs font-bold text-white">Panier</Text>
            </Pressable>
          </View>
        </View>

        <Text className="text-[10px] font-medium text-slate-400 text-center">
          🔒 La réduction sera appliquée automatiquement lors de la répartition.
        </Text>
      </View>

      {/* Group Payment Split Modal */}
      <GroupPaymentSplitModal
        visible={isSplitModalVisible}
        group={group}
        onClose={() => setIsSplitModalVisible(false)}
        onConfirmSplit={handleConfirmSplit}
      />
    </View>
  );
}
