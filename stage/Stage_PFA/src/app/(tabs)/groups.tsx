import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, GroupOrderType } from '@/services/dataService';
import { GroupCard } from '@/components';

/**
 * Commande Collective Hub Screen matching Left Mockup.
 * Displays top create/join cards, tabs, filters, and open group orders list.
 */
export default function GroupsTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [openGroups, setOpenGroups] = useState<GroupOrderType[]>([]);
  const [activeTab, setActiveTab] = useState<'open' | 'my' | 'completed'>('open');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await dataService.getGroupOrders();
        if (res.data) {
          setOpenGroups(res.data);
        }
      } catch (error) {
        console.error('Error loading group orders:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, []);

  const handleCreateGroup = () => {
    Alert.alert(
      'Créer un groupe',
      'Choisissez un restaurant pour démarrer votre commande collective.',
      [
        { text: 'Pizza Hut', onPress: () => router.push({ pathname: '/restaurant/[id]', params: { id: 'pizza-hut' } }) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleJoinByCode = () => {
    Alert.prompt
      ? Alert.prompt('Rejoindre avec un code', 'Saisissez le code du groupe ou scannnez le QR :', (code) => {
          if (code) router.push({ pathname: '/group-order', params: { groupId: 'g_pizzahut_1' } });
        })
      : Alert.alert('Rejoindre', 'Saisissez le code de votre ami pour rejoindre le groupe.');
  };

  return (
    <View className="flex-1 bg-background-offWhite">
      {/* Top Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
        className="px-5 pb-3 bg-white flex-row items-center justify-between border-b border-slate-200/80"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-200">
            <Ionicons name="people" size={22} color="#16a34a" />
          </View>
          <View>
            <Text className="text-xl font-extrabold text-slate-900">
              Commande collective
            </Text>
            <Text className="text-xs font-medium text-slate-500">
              Manger ensemble, payer moins cher !
            </Text>
          </View>
        </View>

        {/* Bell Icon with Badge */}
        <Pressable
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-200 relative"
        >
          <Ionicons name="notifications-outline" size={20} color="#1e293b" />
          <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-[10px] font-bold text-white">3</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4">
        {/* Top Action Cards (Créer / Rejoindre) */}
        <View className="flex-row space-x-3 mb-5">
          {/* Card 1: Créer une commande */}
          <Pressable
            onPress={handleCreateGroup}
            className="flex-1 bg-emerald-50/70 border border-emerald-300 rounded-2xl p-4 flex-row items-center justify-between shadow-2xs mr-1.5 active:bg-emerald-100/70"
          >
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-emerald-950 mb-0.5">
                Créer une commande
              </Text>
              <Text className="text-[10px] text-emerald-700 leading-4 font-medium">
                Crée ton groupe et invite tes amis à commander
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-xs">
              <Ionicons name="add" size={20} color="#ffffff" />
            </View>
          </Pressable>

          {/* Card 2: Rejoindre avec un code */}
          <Pressable
            onPress={handleJoinByCode}
            className="flex-1 bg-orange-50/50 border border-orange-200 rounded-2xl p-4 flex-row items-center justify-between shadow-2xs ml-1.5 active:bg-orange-100/50"
          >
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-slate-900 mb-0.5">
                Rejoindre avec un code
              </Text>
              <Text className="text-[10px] text-slate-500 leading-4 font-medium">
                Entre un code ou scanne un QR pour rejoindre
              </Text>
            </View>
            <View className="w-8 h-8 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-2xs">
              <Ionicons name="qr-code-outline" size={18} color="#475569" />
            </View>
          </Pressable>
        </View>

        {/* Tab Filters (Ouvertes, Mes groupes, Terminées) */}
        <View className="flex-row items-center border-b border-slate-200 mb-4">
          <Pressable
            onPress={() => setActiveTab('open')}
            className={`pb-2.5 mr-6 ${
              activeTab === 'open' ? 'border-b-2 border-primary' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'open' ? 'text-primary font-extrabold' : 'text-slate-500'
              }`}
            >
              Ouvertes
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('my')}
            className={`pb-2.5 mr-6 ${
              activeTab === 'my' ? 'border-b-2 border-primary' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'my' ? 'text-primary font-extrabold' : 'text-slate-500'
              }`}
            >
              Mes groupes
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('completed')}
            className={`pb-2.5 ${
              activeTab === 'completed' ? 'border-b-2 border-primary' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'completed' ? 'text-primary font-extrabold' : 'text-slate-500'
              }`}
            >
              Terminées
            </Text>
          </Pressable>
        </View>

        {/* University Filter & Map Toggle */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable className="flex-row items-center bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
            <Text className="text-xs font-medium text-slate-700 mr-1">
              🎓 Toutes les universités
            </Text>
            <Ionicons name="swap-vertical" size={14} color="#64748b" />
          </Pressable>

          <Pressable className="flex-row items-center bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
            <Text className="text-xs font-medium text-slate-700 mr-1">Filtres</Text>
            <Ionicons name="options-outline" size={14} color="#64748b" />
          </Pressable>
        </View>

        {/* Subtitle */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-bold text-slate-900">
            🎯 Commandes ouvertes autour de toi
          </Text>
          <Pressable className="flex-row items-center">
            <Ionicons name="map-outline" size={13} color="#16a34a" style={{ marginRight: 3 }} />
            <Text className="text-xs font-bold text-primary">Voir la carte</Text>
          </Pressable>
        </View>

        {/* Open Groups Cards */}
        {loading ? (
          <ActivityIndicator size="small" color="#16a34a" className="my-8" />
        ) : (
          openGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={(id) => router.push({ pathname: '/group-order', params: { groupId: id } })}
            />
          ))
        )}

        {/* Bottom Banner Callout */}
        <View className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex-row items-center justify-between mb-10 shadow-2xs">
          <View className="flex-1 mr-3">
            <Text className="text-xs font-extrabold text-emerald-950 mb-0.5">
              Plus on est nombreux, plus on économise !
            </Text>
            <Text className="text-[11px] text-emerald-700 font-medium">
              Invitez vos amis et profitez de réductions exclusives 🎉
            </Text>
          </View>
          <Ionicons name="bag-handle" size={32} color="#16a34a" />
        </View>
      </ScrollView>
    </View>
  );
}
