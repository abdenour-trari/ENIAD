import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, LoyaltyDataType } from '@/services/dataService';
import {
  ProgressCard,
  LevelCard,
  RewardCardSection,
  CouponSection,
  ProgressGauge,
  UpcomingRewardsList,
} from '@/components';

import { ASSETS } from '@/assets';

/**
 * Pixel-Perfect Loyalty Screen matching both Left (Overview) and Right (Levels & Rewards) Mockups.
 * Assembles all 4 reusable loyalty components with static JSON data and tab switching.
 */
export default function LoyaltyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loyalty, setLoyalty] = useState<LoyaltyDataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards'>('overview');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('gold');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await dataService.getLoyaltyData();
        if (res.data) {
          setLoyalty(res.data);
        }
      } catch (error) {
        console.error('Error loading loyalty data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !loyalty) {
    return (
      <View className="flex-1 items-center justify-center bg-background-offWhite">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const {
    points,
    targetPoints,
    currentLevel,
    nextLevel,
    pointsRemaining,
    levels,
    goldPerks,
    myPerks,
    rewards,
    coupons,
    pointsHistory,
    howToEarn,
  } = loyalty;

  return (
    <View className="flex-1 bg-background-offWhite">
      {/* Header Bar */}
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

        <Text className="text-base font-bold text-slate-900">Fidélité</Text>

        <Pressable
          onPress={() => Alert.alert('Aide Fidélité', 'Cumulez des points à chaque commande et débloquez des avantages exclusifs !')}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center border border-slate-200"
        >
          <Ionicons name="help-circle-outline" size={20} color="#1e293b" />
        </Pressable>
      </View>

      {/* Sub Tab Switcher (Vue Aperçu / Vue Niveaux & Récompenses) */}
      <View className="flex-row bg-white border-b border-slate-200/80 px-4 py-2">
        <Pressable
          onPress={() => setActiveTab('overview')}
          className={`flex-1 py-2 rounded-xl items-center mr-1.5 ${
            activeTab === 'overview' ? 'bg-primary' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'overview' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Aperçu des points
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('rewards')}
          className={`flex-1 py-2 rounded-xl items-center ml-1.5 ${
            activeTab === 'rewards' ? 'bg-primary' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'rewards' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Niveaux & Récompenses
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4 pb-10">
        {activeTab === 'overview' ? (
          <>
            {/* 1. Animated Progress Gauge Component (Replaces Raw Points) */}
            <ProgressGauge
              currentPoints={points}
              targetPoints={targetPoints}
              nextRewardName="Réduction -15% Pizza Hut"
              nextLevelName={nextLevel}
              onPress={() => setActiveTab('rewards')}
            />

            {/* 2. Upcoming Rewards List with Remaining Points */}
            <UpcomingRewardsList currentPoints={points} />


            {/* 3. Mes avantages Horizontal Scroll */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-sm font-bold text-slate-900">Mes avantages</Text>
                <Pressable onPress={() => setActiveTab('rewards')}>
                  <Text className="text-xs font-semibold text-primary">Voir tous &gt;</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {myPerks.map((pk) => (
                  <View
                    key={pk.id}
                    className="mr-3 w-32 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs items-center justify-between"
                  >
                    <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mb-2 border border-emerald-200">
                      <Ionicons name={pk.icon as any} size={20} color="#16a34a" />
                    </View>
                    <Text className="text-xs font-bold text-slate-900 text-center mb-2" numberOfLines={2}>
                      {pk.title}
                    </Text>
                    <View className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <Text className="text-[10px] font-bold text-emerald-700">{pk.points}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 4. Exclusive Rewards Gift Box Callout Banner */}
            <View className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex-row items-center justify-between shadow-2xs mb-4">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-bold text-slate-900 mb-1">
                  Débloque des récompenses exclusives 🎉
                </Text>
                <Text className="text-[11px] text-slate-500 font-medium leading-4 mb-3">
                  Utilise tes points pour profiter d'avantages spéciaux chez tes restos préférés.
                </Text>

                <Pressable
                  onPress={() => setActiveTab('rewards')}
                  className="bg-primary active:bg-primary-700 px-4 py-2 rounded-xl self-start shadow-xs"
                >
                  <Text className="text-xs font-bold text-white">Découvrir les offres</Text>
                </Pressable>
              </View>

              <Image
                source={ASSETS.giftBox}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>

            {/* 5. Comment gagner des points ? */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-8">
              <Text className="text-sm font-bold text-slate-900 mb-3">
                Comment gagner des points ?
              </Text>

              <View className="divide-y divide-slate-100">
                {howToEarn.map((item) => (
                  <View key={item.id} className="flex-row items-center justify-between py-2.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-3 border border-emerald-200">
                        <Ionicons name={item.icon as any} size={16} color="#16a34a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{item.title}</Text>
                        <Text className="text-[10px] text-slate-500 font-medium">{item.subtitle}</Text>
                      </View>
                    </View>

                    <Text className="text-xs font-extrabold text-emerald-600">{item.points}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* View 2: Levels, Rewards, Coupons & Points History (Right Mockup) */
          <View className="space-y-4">
            {/* 1. LevelCard Component */}
            <LevelCard
              levels={levels as any}
              goldPerks={goldPerks}
              selectedLevelId={selectedLevelId}
              onSelectLevel={setSelectedLevelId}
            />

            {/* 2. RewardCardSection Component */}
            <RewardCardSection
              rewards={rewards as any}
              onSeeAllPress={() => Alert.alert('Récompenses', 'Toutes les récompenses disponibles')}
            />

            {/* 3. CouponSection Component */}
            <CouponSection
              coupons={coupons as any}
              onSeeAllPress={() => Alert.alert('Coupons', 'Tous vos coupons disponibles')}
            />

            {/* 4. Historique des points Section */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-8">
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-sm font-bold text-slate-900">Historique des points</Text>
                <Pressable onPress={() => Alert.alert('Historique', 'Historique complet des points')}>
                  <Text className="text-xs font-semibold text-primary">Voir tout &gt;</Text>
                </Pressable>
              </View>

              <View className="divide-y divide-slate-100">
                {pointsHistory.map((h) => (
                  <View key={h.id} className="flex-row items-center justify-between py-2.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                        <Ionicons name={h.icon as any} size={16} color="#16a34a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{h.title}</Text>
                        <Text className="text-[10px] text-slate-400 font-medium">{h.dateText}</Text>
                      </View>
                    </View>

                    <Text className="text-xs font-extrabold text-emerald-600">{h.pointsText}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
