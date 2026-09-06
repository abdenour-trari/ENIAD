import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, OrderTrackingType } from '@/services/dataService';
import { ASSETS } from '@/assets';
import { usePrefetch } from '@/hooks';
import { DeliveryTimeline, DeliveryStepItem, AnimatedDeliveryMap, LoyaltyPointsToast, LoadingState, ErrorState } from '@/components';

/**
 * Pixel-Perfect Order Tracking Screen matching both Left (Map Overview) and Right (Driver Detail) Mockups.
 * Includes order confirmation loyalty points Toast animation trigger and preloaded data consumption.
 */
export default function OrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pointsEarned } = useLocalSearchParams<{ pointsEarned?: string }>();

  // Consume prefetched tracking data (preloaded during payment step)
  const { data: prefetchedTrackingResponse, isLoading: prefetchLoading } = usePrefetch(
    'tracking_data',
    () => dataService.getOrderTracking()
  );

  const [order, setOrder] = useState<OrderTrackingType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(2); // Default step 3: En route
  const [activeTab, setActiveTab] = useState<'map' | 'driver'>('map');
  const [isGpsSignalLost, setIsGpsSignalLost] = useState<boolean>(false);
  const [lastKnownTimestamp, setLastKnownTimestamp] = useState<string>('13:04:15');
  const [showLoyaltyToast, setShowLoyaltyToast] = useState<boolean>(true);

  useEffect(() => {
    if (prefetchedTrackingResponse?.data) {
      setOrder(prefetchedTrackingResponse.data);
      setLoading(false);
    } else if (!prefetchLoading) {
      async function loadData() {
        try {
          const res = await dataService.getOrderTracking();
          if (res.data) setOrder(res.data);
        } catch (error) {
          console.error('Error loading order tracking:', error);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }
  }, [prefetchedTrackingResponse, prefetchLoading]);


  // 5-second automatic status change simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isGpsSignalLost) {
        setCurrentStepIndex((prev) => (prev >= 3 ? 0 : prev + 1));
        const now = new Date();
        setLastKnownTimestamp(
          `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        );
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isGpsSignalLost]);

  const handleReconnectGps = () => {
    setIsGpsSignalLost(false);
    const now = new Date();
    setLastKnownTimestamp(
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    );
    Alert.alert('GPS Reconnecté ! 🛰️', 'Le signal GPS du livreur a été rétabli avec succès.');
  };

  const handleCallDriver = async () => {
    const phone = order?.driver?.phone || '+212612345678';
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneUrl = `tel:${cleanPhone}`;
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Appel livreur 📞', `Composition du numéro : ${phone}`);
      }
    } catch (error) {
      Alert.alert('Appel livreur 📞', `Composition du numéro : ${phone}`);
    }
  };

  const handleSendMessageDriver = async () => {
    const phone = order?.driver?.phone || '+212612345678';
    const cleanPhone = phone.replace(/\s+/g, '');
    const smsUrl = `sms:${cleanPhone}`;
    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('Message au livreur 💬', `Envoi du SMS / Chat vers ${order?.driver?.name || 'le livreur'}`);
      }
    } catch (error) {
      Alert.alert('Message au livreur 💬', `Envoi du SMS / Chat vers ${order?.driver?.name || 'le livreur'}`);
    }
  };



  if (loading) {
    return (
      <LoadingState
        message="Chargement du suivi de commande..."
        submessage="Localisation du livreur en direct"
      />
    );
  }

  if (!order) {
    return (
      <ErrorState
        title="Commande introuvable"
        description="Impossible de récupérer les informations de suivi de cette commande."
        retryText="Retourner à l'accueil"
        onRetry={() => router.push('/')}
      />
    );
  }


  const currentStep = order.timeline[currentStepIndex] || order.timeline[2];

  const timelineSteps: DeliveryStepItem[] = order.timeline.map((st, idx) => ({
    step: st.step,
    title: st.title,
    description: st.description,
    timestamp: st.timestamp,
    iconName:
      idx === 0
        ? 'receipt-outline'
        : idx === 1
        ? 'restaurant-outline'
        : idx === 2
        ? 'bicycle-outline'
        : 'location-outline',
  }));

  const getItemImage = (key?: string) => {

    if (key === 'margherita') return ASSETS.margherita;
    if (key === 'alfredo') return ASSETS.alfredo;
    return ASSETS.pizzaCover;
  };

  return (
    <View className="flex-1 bg-background-offWhite relative">
      {/* Animated Order Confirmation Loyalty Points Toast */}
      <LoyaltyPointsToast
        visible={showLoyaltyToast}
        pointsEarned={Number(pointsEarned) || 85}
        message="Vos points de fidélité ont été ajoutés à votre compte !"
        onDismiss={() => setShowLoyaltyToast(false)}
      />

      {/* Top Navigation Bar */}

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
          <Text className="text-base font-bold text-slate-900">
            {activeTab === 'map' ? 'Suivi de commande' : 'Commande en cours'}
          </Text>
          <Text className="text-[11px] font-semibold text-emerald-700">
            Commande {order.orderId}
          </Text>
        </View>

        <Pressable
          onPress={() => Alert.alert('Support Jiblina', 'Service client disponible 24/7.')}
          className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center border border-emerald-200"
        >
          <Ionicons name="headset-outline" size={18} color="#16a34a" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-10">
        {/* Simulation Control Bar */}
        <View className="bg-emerald-900/90 px-4 py-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${isGpsSignalLost ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
            <Text className="text-[11px] font-medium text-emerald-100">
              {isGpsSignalLost ? 'Statut GPS : ' : 'Simulation : '}
              <Text className="font-bold text-white">
                {isGpsSignalLost ? 'Signal perdu (10s)' : currentStep.title}
              </Text>
            </Text>
          </View>
          <View className="flex-row items-center space-x-1.5">
            <Pressable
              onPress={() => setIsGpsSignalLost((prev) => !prev)}
              className={`px-2.5 py-1 rounded-md mr-1.5 ${isGpsSignalLost ? 'bg-amber-600' : 'bg-emerald-700'}`}
            >
              <Text className="text-[10px] font-bold text-white">
                {isGpsSignalLost ? 'Rétablir GPS' : '📡 Perte GPS'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setCurrentStepIndex((prev) => (prev >= 3 ? 0 : prev + 1))}
              className="bg-emerald-800 px-2.5 py-1 rounded-md"
            >
              <Text className="text-[10px] font-bold text-white">Étape +1</Text>
            </Pressable>
          </View>
        </View>

        {/* View Toggle Tabs */}
        <View className="flex-row bg-white border-b border-slate-200/80 px-4 py-2">
          <Pressable
            onPress={() => setActiveTab('map')}
            className={`flex-1 py-2 rounded-xl items-center mr-1.5 ${
              activeTab === 'map' ? 'bg-primary' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'map' ? 'text-white' : 'text-slate-700'
              }`}
            >
              Carte & Direct
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('driver')}
            className={`flex-1 py-2 rounded-xl items-center ml-1.5 ${
              activeTab === 'driver' ? 'bg-primary' : 'bg-slate-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'driver' ? 'text-white' : 'text-slate-700'
              }`}
            >
              Livreur & Étapes
            </Text>
          </Pressable>
        </View>

        {activeTab === 'map' ? (
          <View className="px-4 pt-4 space-y-4">
            {/* Top ETA Card */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 items-center justify-center mr-3">
                  <Ionicons name="bicycle" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900 mb-0.5">
                    Ton livreur est {currentStepIndex === 3 ? 'arrivé !' : 'en route !'}
                  </Text>
                  <Text className="text-xs text-slate-500 font-medium">
                    {currentStepIndex === 3 ? 'Commande livrée' : 'Arrivée estimée dans'}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-xl font-extrabold text-primary">
                  {currentStepIndex === 3 ? 'Livrée' : order.estimatedTimeText}
                </Text>
                <Text className="text-[10px] font-medium text-slate-400">
                  {order.timeVariationText}
                </Text>
              </View>
            </View>

            {/* Interactive Animated Delivery Map Component */}
            <AnimatedDeliveryMap
              targetLocation={
                currentStepIndex === 0
                  ? { latitude: 34.921, longitude: -2.326 }
                  : currentStepIndex === 1
                  ? { latitude: 34.923, longitude: -2.323 }
                  : currentStepIndex === 2
                  ? { latitude: 34.925, longitude: -2.318 }
                  : { latitude: 34.928, longitude: -2.312 }
              }
              estimatedTimeText={currentStepIndex === 3 ? 'Livrée !' : order.estimatedTimeText}
              distanceText="1.2 km"
              restaurantLogo={order.restaurantLogo}
              isGpsSignalLost={isGpsSignalLost}
              lastKnownTimestamp={lastKnownTimestamp}
              lastKnownLocationText="Avenue Hassan II (~600m de chez vous)"
              onRetryGps={handleReconnectGps}
            />



            {/* Delivery Timeline Component (Horizontal) */}
            <DeliveryTimeline
              steps={timelineSteps}
              currentStepIndex={currentStepIndex}
              onStepPress={(idx) => setCurrentStepIndex(idx)}
              orientation="horizontal"
            />


            {/* Loyalty Points Banner */}
            <Pressable
              onPress={() => router.push('/loyalty')}
              className="bg-purple-50 border border-purple-200/90 rounded-2xl p-3.5 flex-row items-center justify-between shadow-2xs"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-purple-600 items-center justify-center mr-3 shadow-xs">
                  <Ionicons name="star" size={18} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-purple-950">
                    Gagne {order.loyaltyPoints} points fidélité
                  </Text>
                  <Text className="text-[11px] text-purple-700 font-medium">
                    Une fois la commande livrée
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9333ea" />
            </Pressable>

            {/* Order Details Breakdown */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-bold text-slate-900">Détails de la commande</Text>
                <Pressable>
                  <Text className="text-xs font-semibold text-primary">Voir tout</Text>
                </Pressable>
              </View>

              <View className="space-y-2 pb-3 border-b border-slate-100 mb-3">
                {order.items.map((it) => (
                  <View key={it.id} className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Image
                        source={getItemImage(it.imageKey)}
                        className="w-10 h-10 rounded-lg mr-2.5 bg-slate-100"
                        resizeMode="cover"
                      />
                      <Text className="text-xs font-bold text-slate-800">{it.name}</Text>
                    </View>
                    <Text className="text-xs font-bold text-slate-900">{it.price} DH</Text>
                  </View>
                ))}
              </View>

              <View className="space-y-1 pb-3 border-b border-slate-100 mb-3">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Total</Text>
                  <Text className="text-xs font-bold text-slate-800">{order.subtotal} DH</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-emerald-600 font-bold">Réduction groupe</Text>
                  <Text className="text-xs font-bold text-emerald-600">-{order.groupDiscount} DH</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-baseline pt-1">
                <Text className="text-sm font-extrabold text-slate-900">Total payé</Text>
                <Text className="text-xl font-extrabold text-primary">{order.totalPaid} DH</Text>
              </View>
            </View>

            {/* Support Button */}
            <Pressable
              onPress={() => Alert.alert('Assistance Jiblina', 'Notre équipe répond à vos questions.')}
              className="w-full py-3.5 rounded-2xl bg-white border border-slate-200 items-center justify-center shadow-2xs mb-8 flex-row"
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#16a34a" style={{ marginRight: 6 }} />
              <Text className="text-xs font-bold text-slate-800">Besoin d'aide ?</Text>
            </Pressable>
          </View>
        ) : (
          /* Driver & Vertical Timeline View (Right Mockup) */
          <View className="px-4 pt-4 space-y-4">
            {/* 3D Scooter Driver Hero Banner */}
            <View className="bg-emerald-700 rounded-3xl p-5 border border-emerald-600 shadow-md relative overflow-hidden flex-row items-center justify-between">
              <View className="flex-1 mr-3 z-10">
                <Text className="text-xl font-extrabold text-white leading-7 mb-1">
                  Ton livreur est{'\n'}
                  <Text className="text-emerald-200">
                    {currentStepIndex === 3 ? 'arrivé ! 🎉' : 'en route !'}
                  </Text>
                </Text>

                <Text className="text-xs text-emerald-100 font-medium mb-2">
                  Arrivée estimée
                </Text>

                <Text className="text-3xl font-black text-white">
                  {order.estimatedTimeText}
                </Text>
                <Text className="text-xs font-semibold text-emerald-200">
                  ({order.timeVariationText})
                </Text>
              </View>

              {/* 3D Scooter Image Illustration */}
              <Image
                source={ASSETS.scooter}
                className="w-32 h-32 z-10"
                resizeMode="contain"
              />
            </View>

            {/* Delivery Timeline Component (Vertical) */}
            <DeliveryTimeline
              steps={timelineSteps}
              currentStepIndex={currentStepIndex}
              onStepPress={(idx) => setCurrentStepIndex(idx)}
              orientation="vertical"
            />


            {/* Informations du livreur & Actions rapides 1 tap */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Informations du livreur
              </Text>

              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: order.driver.avatar }}
                    className="w-14 h-14 rounded-full border-2 border-emerald-200 mr-3"
                  />
                  <View>
                    <Text className="text-base font-bold text-slate-900">
                      {order.driver.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 3 }} />
                      <Text className="text-xs font-bold text-slate-800 mr-1">
                        {order.driver.rating}
                      </Text>
                      <Text className="text-[11px] text-slate-400 font-medium">
                        ({order.driver.totalDeliveries} livraisons)
                      </Text>
                    </View>
                    <Text className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                      📞 {order.driver.phone}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons: Appeler & Message */}
              <View className="flex-row items-center space-x-2 pt-2 border-t border-slate-100">
                <Pressable
                  onPress={handleCallDriver}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center flex-row shadow-sm mr-1.5"
                >
                  <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-extrabold text-white">Appeler le livreur</Text>
                </Pressable>

                <Pressable
                  onPress={handleSendMessageDriver}
                  className="flex-1 py-3 rounded-2xl bg-white border border-slate-300 active:bg-slate-50 items-center justify-center flex-row shadow-2xs ml-1.5"
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#16a34a" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-bold text-slate-800">Envoyer un message</Text>
                </Pressable>
              </View>
            </View>


            {/* Real-time Location Mini Map */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <Text className="text-xs font-bold text-slate-900 mb-3">
                Localisation en temps réel
              </Text>

              <View className="h-32 w-full rounded-xl overflow-hidden relative bg-slate-100">
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop',
                  }}
                  className="w-full h-full opacity-60"
                  resizeMode="cover"
                />

                <View className="absolute inset-0 items-center justify-center flex-row">
                  <View className="w-10 h-10 rounded-full bg-slate-900 items-center justify-center border-2 border-white shadow-md mr-12">
                    <Image
                      source={{ uri: order.restaurantLogo }}
                      className="w-6 h-6 rounded-full"
                      resizeMode="contain"
                    />
                  </View>

                  <View className="w-10 h-10 rounded-full bg-emerald-600 items-center justify-center border-2 border-white shadow-md">
                    <Ionicons name="bicycle" size={20} color="#ffffff" />
                  </View>
                </View>

                <View className="absolute bottom-2 left-1/2 -ml-16 bg-white/90 px-3 py-1 rounded-full shadow border border-slate-200">
                  <Text className="text-[10px] font-bold text-slate-800">
                    1.2 km • 18 min
                  </Text>
                </View>
              </View>
            </View>

            {/* Delivery Preparation Callout */}
            <View className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex-row items-center shadow-2xs mb-8">
              <View className="w-9 h-9 rounded-xl bg-emerald-100 items-center justify-center mr-3 border border-emerald-300">
                <Ionicons name="bag-handle" size={18} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-emerald-950">Prépare-toi !</Text>
                <Text className="text-[11px] text-emerald-700 font-medium">
                  Vérifie que quelqu'un sera disponible à l'adresse de livraison.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
