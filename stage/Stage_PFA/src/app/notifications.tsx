import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Switch, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, NotificationsDataType } from '@/services/dataService';
import { ASSETS } from '@/assets';

/**
 * Pixel-Perfect Notifications Screen matching both Left (Feed View) and Right (Preferences View) Mockups.
 * Includes category filtering, unread badge clearing, interactive switches, and tab toggling.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<NotificationsDataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allRead, setAllRead] = useState<boolean>(false);

  // Preference switches state
  const [prefsState, setPrefsState] = useState<Record<string, boolean>>({
    pref_orders: true,
    pref_promo: true,
    pref_groups: true,
    pref_loyalty: true,
    pref_messages: true,
    pref_news: false,
    ch_push: true,
    ch_email: false,
    ch_sms: false,
    silent: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await dataService.getNotificationsData();
        if (res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleSwitch = (key: string) => {
    setPrefsState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarkAllRead = () => {
    setAllRead(true);
    Alert.alert('Notifications', 'Toutes les notifications ont été marquées comme lues.');
  };

  if (loading || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-background-offWhite">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const { filters, newNotifications, earlierNotifications, preferences, channels } = data;

  const filterItem = (item: { category: string }) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'orders') return item.category === 'orders';
    if (selectedCategory === 'promo') return item.category === 'promo';
    if (selectedCategory === 'social') return item.category === 'social' || item.category === 'groups';
    return true;
  };

  const filteredNew = newNotifications.filter(filterItem);
  const filteredEarlier = earlierNotifications.filter(filterItem);

  const getItemImage = (key?: string) => {
    if (key === 'pizzaCover') return ASSETS.pizzaCover;
    return ASSETS.burgerCover;
  };

  return (
    <View className="flex-1 bg-background-offWhite">
      {/* Top Header Bar */}
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

        <Text className="text-base font-bold text-slate-900">
          {activeTab === 'feed' ? 'Notifications' : 'Préférences de notifications'}
        </Text>

        {activeTab === 'feed' ? (
          <Pressable onPress={handleMarkAllRead} className="flex-row items-center">
            <Text className="text-xs font-semibold text-primary mr-1">
              Tout marquer comme lu
            </Text>
            <Ionicons name="checkmark-done" size={16} color="#16a34a" />
          </Pressable>
        ) : (
          <View className="w-9 h-9" />
        )}
      </View>

      {/* Sub Tab Switcher (Vue Notifications / Vue Paramètres) */}
      <View className="flex-row bg-white border-b border-slate-200/80 px-4 py-2">
        <Pressable
          onPress={() => setActiveTab('feed')}
          className={`flex-1 py-2 rounded-xl items-center mr-1.5 ${
            activeTab === 'feed' ? 'bg-primary' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'feed' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Flux Notifications
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('settings')}
          className={`flex-1 py-2 rounded-xl items-center ml-1.5 ${
            activeTab === 'settings' ? 'bg-primary' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'settings' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Paramètres & Préférences
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-3 pb-10">
        {activeTab === 'feed' ? (
          <>
            {/* Category Filter Chips Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {filters.map((fl) => {
                const isSelected = selectedCategory === fl.id;
                return (
                  <Pressable
                    key={fl.id}
                    onPress={() => setSelectedCategory(fl.id)}
                    className={`mr-2.5 flex-row items-center px-3.5 py-2 rounded-xl border ${
                      isSelected
                        ? 'bg-emerald-50 border-primary shadow-2xs'
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <Ionicons
                      name={fl.icon as any}
                      size={16}
                      color={isSelected ? '#16a34a' : '#64748b'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-primary' : 'text-slate-700'
                      }`}
                    >
                      {fl.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Nouvelles Section */}
            {filteredNew.length > 0 && (
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                  Nouvelles
                </Text>

                <View className="space-y-3">
                  {filteredNew.map((n) => {
                    const isUnread = n.isUnread && !allRead;
                    return (
                      <View
                        key={n.id}
                        className={`bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex-row items-center justify-between relative ${
                          isUnread ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        {/* Unread Green Indicator Dot */}
                        {isUnread && (
                          <View className="absolute top-4 left-2 w-2 h-2 rounded-full bg-emerald-600" />
                        )}

                        <View className="flex-row items-center flex-1 mr-2 pl-3">
                          {/* Icon Container */}
                          <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3 border border-emerald-200">
                            {n.type === 'order' && <Ionicons name="bag-handle" size={20} color="#16a34a" />}
                            {n.type === 'promo' && <Ionicons name="pricetag" size={20} color="#ea580c" />}
                            {n.type === 'group' && <Ionicons name="people" size={20} color="#9333ea" />}
                            {n.type === 'points' && <Ionicons name="star" size={20} color="#f59e0b" />}
                            {n.type === 'delivered' && <Ionicons name="wallet" size={20} color="#16a34a" />}
                          </View>

                          <View className="flex-1">
                            <Text className="text-xs font-bold text-slate-900 mb-0.5" numberOfLines={1}>
                              {n.title}
                            </Text>
                            <Text className="text-[11px] text-slate-600 font-medium leading-4 mb-1" numberOfLines={2}>
                              {n.subtitle}
                            </Text>
                            <Text className="text-[10px] text-slate-400 font-medium">
                              {n.timeText}
                            </Text>
                          </View>
                        </View>

                        {/* Right Content Badge / Photo */}
                        {n.imageKey && (
                          <Image
                            source={getItemImage(n.imageKey)}
                            className="w-12 h-12 rounded-xl bg-slate-100"
                            resizeMode="cover"
                          />
                        )}
                        {n.discountBadge && (
                          <View className="bg-orange-100 px-2 py-1 rounded-lg border border-orange-200">
                            <Text className="text-xs font-extrabold text-orange-600">
                              {n.discountBadge}
                            </Text>
                          </View>
                        )}
                        {n.groupBadge && (
                          <View className="bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 items-center">
                            <Text className="text-xs font-extrabold text-emerald-800">
                              {n.groupBadge}
                            </Text>
                          </View>
                        )}
                        {n.pointsBadge && (
                          <View className="bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Text className="text-xs font-extrabold text-amber-700">
                              {n.pointsBadge}
                            </Text>
                          </View>
                        )}
                        {n.logoUrl && (
                          <Image
                            source={{ uri: n.logoUrl }}
                            className="w-10 h-10 rounded-full border border-slate-200"
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Plus tôt Section */}
            {filteredEarlier.length > 0 && (
              <View className="mb-8">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                  Plus tôt
                </Text>

                <View className="space-y-3">
                  {filteredEarlier.map((n) => (
                    <View
                      key={n.id}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1 mr-2 pl-3">
                        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                          {n.type === 'new_restaurant' && <Ionicons name="megaphone" size={20} color="#ea580c" />}
                          {n.type === 'reward' && <Ionicons name="gift" size={20} color="#ec4899" />}
                          {n.type === 'message' && <Ionicons name="chatbubble-ellipses" size={20} color="#2563eb" />}
                        </View>

                        <View className="flex-1">
                          <Text className="text-xs font-bold text-slate-900 mb-0.5" numberOfLines={1}>
                            {n.title}
                          </Text>
                          <Text className="text-[11px] text-slate-600 font-medium leading-4 mb-1" numberOfLines={2}>
                            {n.subtitle}
                          </Text>
                          <Text className="text-[10px] text-slate-400 font-medium">
                            {n.timeText}
                          </Text>
                        </View>
                      </View>

                      {n.logoUrl && (
                        <Image
                          source={{ uri: n.logoUrl }}
                          className="w-10 h-10 rounded-full border border-slate-200"
                          resizeMode="contain"
                        />
                      )}
                      {n.rewardBadge && (
                        <View className="bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200">
                          <Text className="text-[10px] font-bold text-emerald-800">
                            {n.rewardBadge}
                          </Text>
                        </View>
                      )}
                      {n.avatar && (
                        <Image
                          source={{ uri: n.avatar }}
                          className="w-10 h-10 rounded-full border border-slate-200"
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          /* View 2: Preferences & Settings (Right Mockup) */
          <View className="space-y-4">
            {/* Hero Green Bell Banner */}
            <View className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 items-center justify-center text-center shadow-2xs mb-2">
              <View className="w-16 h-16 rounded-full bg-emerald-600 items-center justify-center shadow-md mb-3 border-2 border-white relative">
                <Ionicons name="notifications" size={32} color="#ffffff" />
                <View className="absolute -top-1 -right-1 bg-amber-400 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                  <Text className="text-xs font-black text-amber-950">1</Text>
                </View>
              </View>

              <Text className="text-base font-bold text-slate-900 text-center mb-1">
                Reste informé, ne rate rien !
              </Text>
              <Text className="text-xs text-slate-500 font-medium text-center px-4">
                Personnalise tes notifications selon tes préférences.
              </Text>
            </View>

            {/* Préférences de notifications List */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Préférences de notifications
              </Text>

              <View className="divide-y divide-slate-100">
                {preferences.map((pref) => {
                  const isEnabled = prefsState[pref.id] ?? pref.enabled;
                  return (
                    <View
                      key={pref.id}
                      className="flex-row items-center justify-between py-3"
                    >
                      <View className="flex-row items-center flex-1 mr-3">
                        <View className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center mr-3 border border-emerald-200">
                          <Ionicons name={pref.icon as any} size={18} color="#16a34a" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs font-bold text-slate-900">{pref.title}</Text>
                          <Text className="text-[11px] text-slate-500 font-medium">{pref.subtitle}</Text>
                        </View>
                      </View>

                      <Switch
                        value={isEnabled}
                        onValueChange={() => handleToggleSwitch(pref.id)}
                        trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
                        thumbColor="#ffffff"
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Méthode de réception List */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Méthode de réception
              </Text>

              <View className="divide-y divide-slate-100">
                {channels.map((ch) => {
                  const isEnabled = prefsState[ch.id] ?? ch.enabled;
                  return (
                    <View
                      key={ch.id}
                      className="flex-row items-center justify-between py-3"
                    >
                      <View className="flex-row items-center flex-1 mr-3">
                        <View className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                          <Ionicons name={ch.icon as any} size={18} color="#475569" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs font-bold text-slate-900">{ch.title}</Text>
                          <Text className="text-[11px] text-slate-500 font-medium">{ch.subtitle}</Text>
                        </View>
                      </View>

                      <Switch
                        value={isEnabled}
                        onValueChange={() => handleToggleSwitch(ch.id)}
                        trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
                        thumbColor="#ffffff"
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Ne pas déranger */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Ne pas déranger
              </Text>

              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-9 h-9 rounded-full bg-indigo-50 items-center justify-center mr-3 border border-indigo-200">
                    <Ionicons name="moon" size={18} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-900">Mode silencieux</Text>
                    <Text className="text-[11px] text-slate-500 font-medium">
                      Désactive toutes les notifications
                    </Text>
                  </View>
                </View>

                <Switch
                  value={prefsState.silent}
                  onValueChange={() => handleToggleSwitch('silent')}
                  trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Time pickers row */}
              <View className="flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-2">
                <Text className="text-xs font-medium text-slate-600">De</Text>
                <View className="bg-white border border-slate-200 px-3 py-1 rounded-lg">
                  <Text className="text-xs font-bold text-slate-900">22:00</Text>
                </View>

                <Text className="text-xs font-medium text-slate-600">à</Text>
                <View className="bg-white border border-slate-200 px-3 py-1 rounded-lg">
                  <Text className="text-xs font-bold text-slate-900">08:00</Text>
                </View>
              </View>
            </View>

            {/* Preferences Saved Toast */}
            <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex-row items-center justify-between mb-8 shadow-2xs">
              <View className="flex-row items-center flex-1 mr-2">
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" style={{ marginRight: 8 }} />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-950">
                    Tes préférences sont sauvegardées
                  </Text>
                  <Text className="text-[11px] text-emerald-700 font-medium">
                    Tu peux les modifier à tout moment.
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#16a34a" />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
