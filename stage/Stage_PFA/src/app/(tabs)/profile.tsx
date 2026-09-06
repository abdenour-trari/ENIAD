import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, ProfileDataType } from '@/services/dataService';
import {
  ProfileHeader,
  StatSection,
  BadgeSection,
  ShortcutsList,
  InviteBanner,
  OrderHistorySection,
} from '@/components';
import { useAppStore } from '@/store/useAppStore';

/**
 * Pixel-Perfect Profile Tab Screen matching both Left (Main Profile) and Right (Activity & Settings) Mockups.
 * Assembles all 6 reusable profile components with static JSON data and tab switching.
 */
export default function ProfileTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const clearCart = useAppStore((state) => state.clearCart);

  const [profile, setProfile] = useState<ProfileDataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await dataService.getProfileData();
        if (res.data) {
          setProfile(res.data);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            clearCart();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background-offWhite">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const { user, level, kpis, badges, recentOrders, activityStats, shortcuts, settings } = profile;

  return (
    <View className="flex-1 bg-background-offWhite">
      {/* Header Bar */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
        className="px-5 pb-3 bg-white border-b border-slate-200/80 flex-row items-center justify-between z-10"
      >
        <Text className="text-2xl font-extrabold text-slate-900">
          {activeTab === 'profile' ? 'Profil' : 'Mon activité'}
        </Text>

        {/* Notification Bell */}
        <Pressable
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-200 relative"
        >
          <Ionicons name="notifications-outline" size={20} color="#1e293b" />
          <View className="absolute -top-1 -right-1 bg-emerald-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-[10px] font-bold text-white">3</Text>
          </View>
        </Pressable>
      </View>

      {/* Sub Tab Switcher (Vue Profil / Vue Mon Activité) */}
      <View className="flex-row bg-white border-b border-slate-200/80 px-5 py-2">
        <Pressable
          onPress={() => setActiveTab('profile')}
          className={`flex-1 py-2 rounded-xl items-center mr-2 ${
            activeTab === 'profile' ? 'bg-primary' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'profile' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Vue Profil
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('activity')}
          className={`flex-1 py-2 rounded-xl items-center ml-2 ${
            activeTab === 'activity' ? 'bg-primary' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'activity' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Mon Activité & Badges
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-10">
        {activeTab === 'profile' ? (
          <>
            {/* 1. Profile Header Component */}
            <ProfileHeader
              user={user}
              level={level}
              onEditAvatar={() => Alert.alert('Avatar', 'Changer la photo de profil')}
              onViewPerks={() => router.push('/loyalty')}
            />

            {/* 2. Stat Section Component */}
            <StatSection
              kpis={kpis}
              onHistoryPress={() => setActiveTab('activity')}
              onPointsPress={() => router.push('/loyalty')}
              onSavingsPress={() => setActiveTab('activity')}
            />

            {/* 3. Shortcuts Component */}
            <View className="px-5">
              <ShortcutsList
                shortcuts={shortcuts as any}
                onItemPress={(route) => {
                  if (route === '/edit-profile') Alert.alert('Profil', 'Écran de modification du profil');
                  else if (route === '/loyalty') router.push('/loyalty');
                  else if (route === '/payment') router.push('/payment');
                  else router.push('/settings');
                }}
              />
            </View>

            {/* 4. Invite Banner Component */}
            <View className="px-5">
              <InviteBanner
                onInvitePress={() =>
                  Alert.alert(
                    'Invitation',
                    'Code d\'invitation : JIB-ABDENOUR100\nLien copié dans votre presse-papier !'
                  )
                }
              />
            </View>
          </>
        ) : (
          /* Activity & Settings View (Right Mockup) */
          <View className="px-5 pt-4 space-y-4">
            {/* 1. Badge Section Component */}
            <BadgeSection
              badges={badges as any}
              level={level}
              onSeeAllPress={() => router.push('/loyalty')}
            />

            {/* 2. Order History Section Component */}
            <OrderHistorySection
              orders={recentOrders as any}
              onSeeAllPress={() => router.push('/orders')}
              onOrderPress={() => router.push('/tracking')}
            />

            {/* 3. Activity Stats */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-sm font-bold text-slate-900 mb-3">Mes statistiques</Text>
              <View className="flex-row justify-between space-x-2">
                <View className="flex-1 bg-slate-50 rounded-xl p-3 items-center border border-slate-200/80 mr-1">
                  <Ionicons name="people" size={20} color="#16a34a" style={{ marginBottom: 4 }} />
                  <Text className="text-base font-extrabold text-slate-900">
                    {activityStats.collectiveOrdersCount}
                  </Text>
                  <Text className="text-[10px] font-medium text-slate-500 text-center">
                    Commandes collectives
                  </Text>
                </View>

                <View className="flex-1 bg-slate-50 rounded-xl p-3 items-center border border-slate-200/80 mx-1">
                  <Ionicons name="wallet" size={20} color="#ea580c" style={{ marginBottom: 4 }} />
                  <Text className="text-base font-extrabold text-slate-900">
                    {activityStats.totalSavedDH} <Text className="text-xs font-bold">DH</Text>
                  </Text>
                  <Text className="text-[10px] font-medium text-slate-500 text-center">
                    Argent économisé
                  </Text>
                </View>

                <View className="flex-1 bg-slate-50 rounded-xl p-3 items-center border border-slate-200/80 ml-1">
                  <Ionicons name="location" size={20} color="#9333ea" style={{ marginBottom: 4 }} />
                  <Text className="text-base font-extrabold text-slate-900">
                    {activityStats.restaurantsVisited}
                  </Text>
                  <Text className="text-[10px] font-medium text-slate-500 text-center">
                    Restaurants visités
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. Settings List */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-8">
              <Text className="text-sm font-bold text-slate-900 mb-2">Paramètres</Text>
              <View className="divide-y divide-slate-100">
                {settings.map((st) => (
                  <Pressable
                    key={st.id}
                    onPress={() => (st.route ? router.push(st.route as any) : null)}
                    className="flex-row items-center justify-between py-3 px-1"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <Ionicons name={st.icon as any} size={18} color="#475569" style={{ marginRight: 10 }} />
                      <Text className="text-xs font-bold text-slate-800">{st.title}</Text>
                    </View>

                    <View className="flex-row items-center">
                      {st.value && (
                        <Text className="text-xs font-medium text-slate-400 mr-2">{st.value}</Text>
                      )}
                      <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </View>
                  </Pressable>
                ))}

                {/* Logout Action */}
                <Pressable
                  onPress={handleLogout}
                  className="flex-row items-center py-3.5 px-1 pt-4"
                >
                  <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 10 }} />
                  <Text className="text-xs font-bold text-red-500">Déconnexion</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
