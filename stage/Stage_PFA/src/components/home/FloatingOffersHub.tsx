import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PromotionsDataType } from '@/services/dataService';

interface FloatingOffersHubProps {
  promotions: PromotionsDataType;
}

export const FloatingOffersHub: React.FC<FloatingOffersHubProps> = ({ promotions }) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'spinner' | 'iphone' | 'monthly' | 'resto'>('spinner');

  // Spinner State
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [votesCount, setVotesCount] = useState<Record<string, number>>({});

  const { spinnerPrizes, bestChefCompetition, monthlyTopOrderers, restaurantOfTheWeek } = promotions;

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * spinnerPrizes.length);
      const prize = spinnerPrizes[randomIndex];
      setWonPrize(prize.label);
      setIsSpinning(false);

      Alert.alert(
        'Félicitations ! 🎉',
        `Vous avez gagné : ${prize.label}\nCode promo : ${prize.code}`,
        [{ text: 'Profiter maintenant', onPress: () => setModalVisible(false) }]
      );
    }, 1500);
  };

  const handleVote = (dishId: string, dishName: string) => {
    setVotesCount((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1,
    }));
    Alert.alert('Vote pris en compte ! ⭐', `Vous avez voté pour "${dishName}".`);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-5 bg-primary active:bg-primary-700 px-4 py-3 rounded-full flex-row items-center justify-center shadow-xl border-2 border-white z-40"
      >
        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-2">
          <Ionicons name="gift" size={20} color="#ffffff" />
        </View>
        <Text className="text-xs font-black text-white tracking-wide">OFFRES 🎉</Text>
        <View className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2 animate-ping" />
      </Pressable>

      {/* Gamification Hub Overlay - Clean absolute view overlay preventing body scroll lock */}
      {modalVisible && (
        <View className="absolute inset-0 bg-black/60 justify-end z-50">
          <View className="bg-white rounded-t-3xl h-[85%] overflow-hidden">
            {/* Modal Header */}
            <View className="px-5 py-4 border-b border-slate-200/80 flex-row items-center justify-between bg-slate-50">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center mr-3 border border-emerald-300">
                  <Ionicons name="trophy" size={20} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-lg font-black text-slate-900">Hub d'Offres & Jeux</Text>
                  <Text className="text-xs text-slate-500 font-medium">Gagnez des prix exclusifs Jiblina !</Text>
                </View>
              </View>

              <Pressable
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-white items-center justify-center border border-slate-200"
              >
                <Ionicons name="close" size={18} color="#475569" />
              </Pressable>
            </View>

            {/* Navigation Tabs */}
            <View className="flex-row bg-slate-100 p-1.5 border-b border-slate-200 px-3">
              <Pressable
                onPress={() => setActiveTab('spinner')}
                className={`flex-1 py-2 rounded-xl items-center mr-1 ${
                  activeTab === 'spinner' ? 'bg-white border border-slate-200 shadow-2xs' : ''
                }`}
              >
                <Text className={`text-[11px] font-bold ${activeTab === 'spinner' ? 'text-primary' : 'text-slate-600'}`}>
                  🎡 Spinner
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('iphone')}
                className={`flex-1 py-2 rounded-xl items-center mx-1 ${
                  activeTab === 'iphone' ? 'bg-white border border-slate-200 shadow-2xs' : ''
                }`}
              >
                <Text className={`text-[11px] font-bold ${activeTab === 'iphone' ? 'text-primary' : 'text-slate-600'}`}>
                  📱 Best Chef
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('monthly')}
                className={`flex-1 py-2 rounded-xl items-center mx-1 ${
                  activeTab === 'monthly' ? 'bg-white border border-slate-200 shadow-2xs' : ''
                }`}
              >
                <Text className={`text-[11px] font-bold ${activeTab === 'monthly' ? 'text-primary' : 'text-slate-600'}`}>
                  🥇 Top 3
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('resto')}
                className={`flex-1 py-2 rounded-xl items-center ml-1 ${
                  activeTab === 'resto' ? 'bg-white border border-slate-200 shadow-2xs' : ''
                }`}
              >
                <Text className={`text-[11px] font-bold ${activeTab === 'resto' ? 'text-primary' : 'text-slate-600'}`}>
                  🏆 Resto Semaine
                </Text>
              </Pressable>
            </View>

            {/* Content Body */}
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
              {activeTab === 'spinner' && (
                /* Tab 1: Wheel of Fortune Spinner */
                <View className="items-center py-2">
                  <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl w-full mb-5 items-center">
                    <Text className="text-base font-extrabold text-emerald-950 text-center mb-1">
                      🎡 Roue de la Fortune Hebdomadaire
                    </Text>
                    <Text className="text-xs text-emerald-700 text-center font-medium">
                      Tournez la roue une fois par semaine pour tenter de gagner des réductions et cadeaux !
                    </Text>
                  </View>

                  {/* Wheel Display Grid */}
                  <View className="w-full bg-slate-900 p-4 rounded-3xl mb-5 shadow-lg border-2 border-emerald-500">
                    <View className="flex-row flex-wrap justify-between">
                      {spinnerPrizes.map((p) => (
                        <View
                          key={p.id}
                          className="w-[48%] bg-slate-800 p-3 rounded-2xl mb-3 border border-slate-700 items-center justify-center"
                        >
                          <Text className="text-xs font-bold text-white text-center">{p.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {wonPrize && (
                    <View className="bg-amber-100 border border-amber-300 p-3 rounded-xl mb-4 w-full items-center">
                      <Text className="text-xs font-extrabold text-amber-900">
                        🎉 Gain récent : {wonPrize}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={handleSpinWheel}
                    disabled={isSpinning}
                    className="bg-primary active:bg-primary-700 w-full py-4 rounded-2xl items-center shadow-md flex-row justify-center space-x-2"
                  >
                    <Text className="text-base font-extrabold text-white">
                      {isSpinning ? 'Rotation en cours... ⏳' : 'Tourner la roue ! 🎡'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {activeTab === 'iphone' && (
                /* Tab 2: Best Chef iPhone Competition */
                <View className="py-2 space-y-4">
                  {/* Hero Banner Prize */}
                  <View className="bg-gradient-to-r bg-emerald-800 rounded-3xl p-5 border border-emerald-600 shadow-md">
                    <View className="bg-amber-400 self-start px-3 py-1 rounded-full mb-2">
                      <Text className="text-[10px] font-black text-amber-950">
                        GRAND PRIX : {bestChefCompetition.prize} 📱
                      </Text>
                    </View>

                    <Text className="text-xl font-black text-white mb-1">
                      {bestChefCompetition.title}
                    </Text>
                    <Text className="text-xs text-emerald-100 font-medium mb-3">
                      {bestChefCompetition.subtitle}
                    </Text>

                    <View className="bg-black/40 self-start px-3 py-1 rounded-lg">
                      <Text className="text-[10px] font-bold text-emerald-300">
                        ⏱ {bestChefCompetition.endDateText}
                      </Text>
                    </View>
                  </View>

                  {/* Leaderboard Dishes */}
                  <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Plats Candidats
                  </Text>

                  {bestChefCompetition.entries.map((item, idx) => {
                    const currentVotes = (votesCount[item.id] || 0) + item.votes;
                    return (
                      <View
                        key={item.id}
                        className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex-row items-center justify-between mb-3"
                      >
                        <View className="flex-row items-center flex-1 mr-2">
                          <View className="w-6 h-6 rounded-full bg-amber-100 items-center justify-center mr-2 border border-amber-300">
                            <Text className="text-[10px] font-black text-amber-900">#{idx + 1}</Text>
                          </View>

                          <Image
                            source={{ uri: item.avatar }}
                            className="w-10 h-10 rounded-full mr-2.5 border border-slate-200"
                          />

                          <View className="flex-1">
                            <Text className="text-xs font-bold text-slate-900">{item.dishName}</Text>
                            <Text className="text-[10px] text-slate-500 font-medium">Par {item.chefName} • {item.school}</Text>
                            <Text className="text-[10px] font-bold text-emerald-600 mt-0.5">
                              ⭐ {currentVotes} votes
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          onPress={() => handleVote(item.id, item.dishName)}
                          className="bg-primary active:bg-primary-700 px-3.5 py-2 rounded-xl shadow-xs"
                        >
                          <Text className="text-xs font-bold text-white">Voter 🗳</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}

              {activeTab === 'monthly' && (
                /* Tab 3: Monthly Top 3 Orderers */
                <View className="py-2 space-y-4">
                  {/* Prize Banner */}
                  <View className="bg-orange-50 border border-orange-200 p-4 rounded-2xl mb-4">
                    <Text className="text-base font-extrabold text-orange-950 mb-1">
                      🥇 {monthlyTopOrderers.title}
                    </Text>
                    <Text className="text-xs font-bold text-orange-700 mb-2">
                      🎁 Récompense : {monthlyTopOrderers.prizeText}
                    </Text>

                    <View className="bg-white border border-orange-200 p-2.5 rounded-xl">
                      <Text className="text-xs font-bold text-slate-800 text-center">
                        🎯 Votre rang : <Text className="text-primary font-extrabold">{monthlyTopOrderers.myRankText}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Leaderboard Cards */}
                  {monthlyTopOrderers.topOrderers.map((ord) => (
                    <View
                      key={ord.rank}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex-row items-center justify-between mb-3"
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-8 h-8 rounded-full bg-amber-400 items-center justify-center mr-3 border border-white shadow-2xs">
                          <Text className="text-xs font-black text-amber-950">#{ord.rank}</Text>
                        </View>

                        <Image
                          source={{ uri: ord.avatar }}
                          className="w-10 h-10 rounded-full mr-3 border border-slate-200"
                        />

                        <View className="flex-1">
                          <Text className="text-xs font-bold text-slate-900">{ord.name}</Text>
                          <Text className="text-[11px] text-slate-500 font-medium">
                            {ord.orderCount} commandes ce mois-ci
                          </Text>
                        </View>
                      </View>

                      <View className="bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <Text className="text-[10px] font-bold text-emerald-800">{ord.reward}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === 'resto' && (
                /* Tab 4: Restaurant of the Week */
                <View className="py-2 space-y-4">
                  <View className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md mb-4">
                    <View className="h-40 w-full relative">
                      <Image
                        source={{ uri: restaurantOfTheWeek.coverUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute top-3 left-3 bg-amber-400 px-3 py-1 rounded-full shadow-md">
                        <Text className="text-xs font-black text-amber-950">
                          {restaurantOfTheWeek.badge}
                        </Text>
                      </View>
                    </View>

                    <View className="p-4">
                      <View className="flex-row items-center mb-2">
                        <Image
                          source={{ uri: restaurantOfTheWeek.logoUrl }}
                          className="w-12 h-12 rounded-full border border-slate-200 mr-3"
                          resizeMode="contain"
                        />
                        <View className="flex-1">
                          <Text className="text-lg font-black text-slate-900">
                            {restaurantOfTheWeek.name}
                          </Text>
                          <Text className="text-xs font-semibold text-emerald-700">
                            🔥 {restaurantOfTheWeek.salesCount}
                          </Text>
                        </View>
                      </View>

                      <View className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl mb-4 flex-row items-center justify-between">
                        <Text className="text-xs font-bold text-emerald-950">
                          Offre exclusive de la semaine :
                        </Text>
                        <Text className="text-sm font-black text-primary">
                          {restaurantOfTheWeek.specialDiscount}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => {
                          setModalVisible(false);
                          router.push({
                            pathname: '/restaurant/[id]',
                            params: { id: restaurantOfTheWeek.restaurantId },
                          });
                        }}
                        className="bg-primary active:bg-primary-700 w-full py-3.5 rounded-2xl items-center shadow-xs"
                      >
                        <Text className="text-xs font-bold text-white">
                          Commander chez {restaurantOfTheWeek.name}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
};
