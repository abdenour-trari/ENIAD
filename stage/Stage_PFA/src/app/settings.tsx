import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Switch, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, SettingsDataType } from '@/services/dataService';
import { useAppStore } from '@/store/useAppStore';

/**
 * Pixel-Perfect Settings Screen matching both Left (Overview) and Right (Detailed Preferences & Security) Mockups.
 * Fully interactive with simulated language switching, theme toggling, cache clearing (0 Mo), and security switches.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const clearCart = useAppStore((state) => state.clearCart);

  const [settings, setSettings] = useState<SettingsDataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  // Interactive Settings State
  const [selectedLang, setSelectedLang] = useState<string>('fr');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [storageSize, setStorageSize] = useState<string>('32,4 Mo');
  const [switchesState, setSwitchesState] = useState<Record<string, boolean>>({
    dataSaver: false,
    fingerprint: true,
    vibration: true,
    sounds: true,
    reminder: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await dataService.getSettingsData();
        if (res.data) {
          setSettings(res.data);
        }
      } catch (error) {
        console.error('Error loading settings data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggle = (key: string) => {
    setSwitchesState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearCache = () => {
    setStorageSize('0 Mo');
    Alert.alert('Cache Vidé ! 🗑', '32,4 Mo de fichiers temporaires ont été nettoyés avec succès.');
  };

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront effacées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            clearCart();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (loading || !settings) {
    return (
      <View className="flex-1 items-center justify-center bg-background-offWhite">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const {
    user,
    languages,
    account,
    preferences,
    appData,
    securitySettings,
    otherPreferences,
    community,
    support,
  } = settings;

  const getLangName = () => {
    if (selectedLang === 'en') return 'English';
    if (selectedLang === 'ar') return 'العربية';
    return 'Français';
  };

  return (
    <View className="flex-1 bg-background-offWhite">
      {/* Top Header Bar */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
        className="px-5 pb-3 bg-white border-b border-slate-200/80 flex-row items-center justify-between z-10"
      >
        <Pressable
          onPress={() => (activeTab === 'detailed' ? setActiveTab('overview') : router.back())}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center border border-slate-200"
        >
          <Ionicons name="chevron-back" size={20} color="#1e293b" />
        </Pressable>

        <Text className="text-xl font-extrabold text-slate-900">Paramètres</Text>

        <Pressable
          onPress={() => router.push('/notifications')}
          className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center border border-slate-200 relative"
        >
          <Ionicons name="notifications-outline" size={18} color="#1e293b" />
          <View className="absolute -top-1 -right-1 bg-emerald-600 w-4 h-4 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-[9px] font-bold text-white">3</Text>
          </View>
        </Pressable>
      </View>

      {/* Sub Tab Switcher (Vue Aperçu Général / Vue Détails & Sécurité) */}
      <View className="flex-row bg-white border-b border-slate-200/80 px-5 py-2">
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
            Vue d'ensemble
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('detailed')}
          className={`flex-1 py-2 rounded-xl items-center ml-1.5 ${
            activeTab === 'detailed' ? 'bg-primary' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'detailed' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Langue, Thème & Sécurité
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4 pb-10">
        {activeTab === 'overview' ? (
          <>
            {/* User Profile Card Banner */}
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex-row items-center justify-between mb-5 active:bg-slate-50"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Image
                  source={{ uri: user.avatar }}
                  className="w-14 h-14 rounded-full mr-3 border-2 border-emerald-500"
                />
                <View className="flex-1">
                  <Text className="text-base font-extrabold text-slate-900 mb-0.5">
                    {user.name}
                  </Text>
                  <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full self-start mb-1">
                    <Text className="text-[10px] font-bold text-emerald-800">
                      🎓 {user.badge}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-slate-500 font-medium">{user.email}</Text>
                  <Text className="text-[11px] text-slate-500 font-medium">{user.phone}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </Pressable>

            {/* Section 1: Compte */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Compte
              </Text>

              <View className="divide-y divide-slate-100">
                {account.map((acc) => (
                  <Pressable
                    key={acc.id}
                    onPress={() => setActiveTab('detailed')}
                    className="flex-row items-center justify-between py-3 px-1"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3 border border-emerald-200">
                        <Ionicons name={acc.icon as any} size={16} color="#16a34a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{acc.title}</Text>
                        <Text className="text-[11px] text-slate-500 font-medium">{acc.subtitle}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Section 2: Préférences */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Préférences
              </Text>

              <View className="divide-y divide-slate-100">
                {preferences.map((pref) => (
                  <Pressable
                    key={pref.id}
                    onPress={() =>
                      pref.route ? router.push(pref.route as any) : setActiveTab('detailed')
                    }
                    className="flex-row items-center justify-between py-3 px-1"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                        <Ionicons name={pref.icon as any} size={16} color="#16a34a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{pref.title}</Text>
                        <Text className="text-[11px] text-slate-500 font-medium">
                          {pref.id === 'pref_lang' ? getLangName() : pref.id === 'pref_theme' ? (selectedTheme === 'light' ? 'Clair' : 'Sombre') : pref.subtitle}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Section 3: App & Données */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                App & Données
              </Text>

              <View className="divide-y divide-slate-100">
                {appData.map((item) => (
                  <View key={item.id} className="flex-row items-center justify-between py-3 px-1">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                        <Ionicons name={item.icon as any} size={16} color="#64748b" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{item.title}</Text>
                        <Text className="text-[11px] text-slate-500 font-medium">{item.subtitle}</Text>
                      </View>
                    </View>

                    {item.isSwitch ? (
                      <Switch
                        value={switchesState.dataSaver}
                        onValueChange={() => handleToggle('dataSaver')}
                        trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
                        thumbColor="#ffffff"
                      />
                    ) : (
                      <Pressable onPress={() => setActiveTab('detailed')} className="flex-row items-center">
                        {item.id === 'app_storage' ? (
                          <Text className="text-xs font-bold text-slate-700 mr-2">{storageSize}</Text>
                        ) : null}
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Section 4: Support */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-8">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Support
              </Text>

              <View className="divide-y divide-slate-100">
                {support.map((sup) => (
                  <Pressable
                    key={sup.id}
                    onPress={() => Alert.alert(sup.title, sup.subtitle)}
                    className="flex-row items-center justify-between py-3 px-1"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                        <Ionicons name={sup.icon as any} size={16} color="#64748b" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{sup.title}</Text>
                        <Text className="text-[11px] text-slate-500 font-medium">{sup.subtitle}</Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                  </Pressable>
                ))}

                {/* Logout Button */}
                <Pressable
                  onPress={handleLogout}
                  className="flex-row items-center py-3.5 px-1 pt-4"
                >
                  <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 10 }} />
                  <Text className="text-xs font-bold text-red-500">Déconnexion</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          /* Detailed Sub-Settings & Preferences (Right Mockup) */
          <View className="space-y-4">
            {/* 1. Langue Selector */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Langue
              </Text>

              <View className="space-y-2">
                {languages.map((lang) => {
                  const isSelected = selectedLang === lang.id;
                  return (
                    <Pressable
                      key={lang.id}
                      onPress={() => {
                        setSelectedLang(lang.id);
                        Alert.alert('Langue', `Langue définie sur ${lang.name}`);
                      }}
                      className={`flex-row items-center justify-between p-3.5 rounded-xl border ${
                        isSelected
                          ? 'bg-emerald-50/60 border-primary shadow-2xs'
                          : 'bg-white border-slate-200/80'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {lang.name}
                      </Text>

                      {isSelected && (
                        <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                          <Ionicons name="checkmark" size={12} color="#ffffff" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 2. Thème de l'application Selector */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Thème de l'application
              </Text>

              <View className="flex-row space-x-3">
                <Pressable
                  onPress={() => setSelectedTheme('light')}
                  className={`flex-1 flex-row items-center justify-between p-4 rounded-2xl border mr-1.5 ${
                    selectedTheme === 'light'
                      ? 'bg-emerald-50/60 border-primary shadow-2xs'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="sunny-outline" size={20} color="#16a34a" style={{ marginRight: 8 }} />
                    <Text className="text-xs font-bold text-slate-900">Clair</Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border items-center justify-center ${
                      selectedTheme === 'light' ? 'bg-primary border-primary' : 'border-slate-300'
                    }`}
                  >
                    {selectedTheme === 'light' && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setSelectedTheme('dark')}
                  className={`flex-1 flex-row items-center justify-between p-4 rounded-2xl border ml-1.5 ${
                    selectedTheme === 'dark'
                      ? 'bg-emerald-50/60 border-primary shadow-2xs'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="moon-outline" size={20} color="#334155" style={{ marginRight: 8 }} />
                    <Text className="text-xs font-bold text-slate-900">Sombre</Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border items-center justify-center ${
                      selectedTheme === 'dark' ? 'bg-primary border-primary' : 'border-slate-300'
                    }`}
                  >
                    {selectedTheme === 'dark' && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                  </View>
                </Pressable>
              </View>
            </View>

            {/* 3. Sécurité Section */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Sécurité
              </Text>

              <View className="divide-y divide-slate-100">
                {securitySettings.map((sec) => (
                  <View key={sec.id} className="flex-row items-center justify-between py-3 px-1">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3 border border-emerald-200">
                        <Ionicons name={sec.icon as any} size={16} color="#16a34a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{sec.title}</Text>
                        <Text className="text-[11px] text-slate-500 font-medium">{sec.subtitle}</Text>
                      </View>
                    </View>

                    {sec.isSwitch ? (
                      <Switch
                        value={switchesState.fingerprint}
                        onValueChange={() => handleToggle('fingerprint')}
                        trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
                        thumbColor="#ffffff"
                      />
                    ) : (
                      <Pressable onPress={() => Alert.alert(sec.title, 'Configurer la sécurité')}>
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* 4. Autres préférences */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Autres préférences
              </Text>

              <View className="divide-y divide-slate-100">
                {otherPreferences.map((oth) => (
                  <View key={oth.id} className="flex-row items-center justify-between py-3 px-1">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                        <Ionicons name={oth.icon as any} size={16} color="#475569" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{oth.title}</Text>
                        <Text className="text-[11px] text-slate-500 font-medium">{oth.subtitle}</Text>
                      </View>
                    </View>

                    {oth.isSwitch ? (
                      <Switch
                        value={
                          oth.id === 'oth_vibration'
                            ? switchesState.vibration
                            : oth.id === 'oth_sounds'
                            ? switchesState.sounds
                            : switchesState.reminder
                        }
                        onValueChange={() =>
                          handleToggle(
                            oth.id === 'oth_vibration'
                              ? 'vibration'
                              : oth.id === 'oth_sounds'
                              ? 'sounds'
                              : 'reminder'
                          )
                        }
                        trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
                        thumbColor="#ffffff"
                      />
                    ) : (
                      <View className="flex-row items-center">
                        <Text className="text-xs font-bold text-slate-700 mr-2">{oth.value}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* 5. Communauté */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Communauté
              </Text>

              <View className="divide-y divide-slate-100">
                {community.map((com) => (
                  <Pressable
                    key={com.id}
                    onPress={() => Alert.alert(com.title, com.subtitle)}
                    className="flex-row items-center justify-between py-3 px-1"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                        <Ionicons name={com.icon as any} size={16} color="#475569" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-900">{com.title}</Text>
                        <Text className="text-[11px] text-slate-500 font-medium">{com.subtitle}</Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* 6. Autres (Vider le cache / Supprimer mon compte) */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-8">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Autres
              </Text>

              <View className="divide-y divide-slate-100">
                <Pressable
                  onPress={handleClearCache}
                  className="flex-row items-center justify-between py-3.5 px-1"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="trash-outline" size={18} color="#475569" style={{ marginRight: 10 }} />
                    <Text className="text-xs font-bold text-slate-800">Vider le cache</Text>
                  </View>
                  <Text className="text-xs font-extrabold text-slate-700">{storageSize}</Text>
                </Pressable>

                <Pressable
                  onPress={handleDeleteAccount}
                  className="flex-row items-center justify-between py-3.5 px-1 pt-4"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="person-remove-outline" size={18} color="#ef4444" style={{ marginRight: 10 }} />
                    <Text className="text-xs font-bold text-red-500">Supprimer mon compte</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#ef4444" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
