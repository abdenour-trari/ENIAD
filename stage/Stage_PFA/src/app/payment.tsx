import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataService, PaymentDataType } from '@/services/dataService';
import { ASSETS } from '@/assets';
import { usePrefetch } from '@/hooks';
import { CartSummaryBar, PaymentErrorState, PaymentErrorPayload, PaymentErrorCode, LoyaltyPointsToast } from '@/components';

/**
 * Pixel-Perfect Payment Screen matching both Left (Individual Share) and Right (Shared Payment) Mockups.
 * 100% static data driven with full client-side action simulation and prefetching.
 */
export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 1. Consume prefetched payment data (preloaded when entering cart)
  const { data: paymentResponse, isLoading: prefetchLoading } = usePrefetch('payment_data', () =>
    dataService.getPaymentData()
  );

  // 2. Prefetch tracking.tsx data immediately upon entering payment screen (prior to order confirmation)
  usePrefetch('tracking_data', () => dataService.getOrderTracking());

  const [paymentData, setPaymentData] = useState<PaymentDataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [viewMode, setViewMode] = useState<'individual' | 'shared'>('individual');
  const [payForWholeGroup, setPayForWholeGroup] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<PaymentErrorPayload | null>(null);
  const [showLoyaltyToast, setShowLoyaltyToast] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(89);

  useEffect(() => {
    if (paymentResponse?.data) {
      setPaymentData(paymentResponse.data);
      setLoading(false);
    } else if (!prefetchLoading) {
      async function loadData() {
        try {
          const res = await dataService.getPaymentData();
          if (res.data) setPaymentData(res.data);
        } catch (error) {
          console.error('Error loading payment data:', error);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }
  }, [paymentResponse, prefetchLoading]);


  const handleSelectMethod = (id: string) => {
    setSelectedMethod(id);
    if (id === 'shared') {
      setViewMode('shared');
    }
  };

  const handleSimulatePayment = (errorCodeToSimulate?: PaymentErrorCode) => {
    setIsProcessing(true);
    setPaymentError(null);
    setTimeout(() => {
      setIsProcessing(false);
      if (errorCodeToSimulate) {
        setPaymentError({
          code: errorCodeToSimulate,
          timestamp: Date.now(),
        });
        return;
      }

      const totalToPay = viewMode === 'shared' || payForWholeGroup ? 355 : 71;
      const pts = Math.round(totalToPay * 1.2);
      setEarnedPoints(pts);
      setShowLoyaltyToast(true);

      Alert.alert(
        'Paiement réussi ! 🎉',
        viewMode === 'shared' || payForWholeGroup
          ? `Le paiement de ${totalToPay} DH pour le groupe a été validé !\n+${pts} points de fidélité gagnés !`
          : `Votre part de ${totalToPay} DH a été payée avec succès !\n+${pts} points de fidélité gagnés !`,
        [
          {
            text: 'Suivre la commande 🛵',
            onPress: () =>
              router.push({
                pathname: '/tracking',
                params: { pointsEarned: pts.toString() },
              }),
          },
        ]
      );
    }, 400);
  };




  if (loading || !paymentData) {
    return (
      <View className="flex-1 items-center justify-center bg-background-offWhite">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const {
    steps,
    orderSummary,
    groupDiscountBanner,
    myShare,
    paymentMethods,
    participants,
    sharedPaymentSummary,
  } = paymentData;

  return (
    <View className="flex-1 bg-background-offWhite relative">
      {/* Loyalty Points Confirmation Toast */}
      <LoyaltyPointsToast
        visible={showLoyaltyToast}
        pointsEarned={earnedPoints}
        onDismiss={() => setShowLoyaltyToast(false)}
      />

      {/* Navigation Header Bar */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
        className="px-4 pb-3 bg-white border-b border-slate-200/80 flex-row items-center justify-between z-10"
      >
        <Pressable
          onPress={() => (viewMode === 'shared' ? setViewMode('individual') : router.back())}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center border border-slate-200"
        >
          <Ionicons name="chevron-back" size={20} color="#1e293b" />
        </Pressable>

        <Text className="text-base font-bold text-slate-900">
          {viewMode === 'shared' ? 'Paiement partagé' : 'Paiement'}
        </Text>

        <View className="w-9 h-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Payment Error Banner (Zod Validated & Mapped) */}
        <PaymentErrorState
          error={paymentError}
          onRetry={() => handleSimulatePayment()}
          onChangePaymentMethod={() => {
            setPaymentError(null);
            setSelectedMethod('cmi');
          }}
          onDismiss={() => setPaymentError(null)}
        />

        {/* Test Error Simulation Bar */}
        <View className="mb-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
            🧪 Tester les erreurs de paiement (Simulation)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {[
              { label: '💳 Carte refusée', code: 'CARD_DECLINED' },
              { label: '💰 Solde insuffisant', code: 'INSUFFICIENT_FUNDS' },
              { label: '⏱ Timeout', code: 'TIMEOUT' },
              { label: '📶 Erreur réseau', code: 'NETWORK_ERROR' },
              { label: '📅 Carte expirée', code: 'EXPIRED_CARD' },
              { label: '🛡️ 3DS Échec', code: 'AUTHENTICATION_FAILED' },
            ].map((errItem) => (
              <Pressable
                key={errItem.code}
                onPress={() => handleSimulatePayment(errItem.code as any)}
                className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl mr-2 shadow-2xs active:bg-slate-100"
              >
                <Text className="text-[11px] font-semibold text-slate-700">{errItem.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>


        {viewMode === 'individual' ? (
          <>
            {/* 1. Steps Bar (1 Panier, 2 Livraison, 3 Paiement, 4 Confirmation) */}
            <View className="flex-row items-center justify-between px-2 py-3 mb-3">
              {steps.map((st, idx) => {
                const isCompleted = st.status === 'completed';
                const isActive = st.status === 'active';
                return (
                  <React.Fragment key={st.number}>
                    <View className="items-center">
                      <View
                        className={`w-7 h-7 rounded-full items-center justify-center border ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600'
                            : isActive
                            ? 'bg-emerald-800 border-emerald-800'
                            : 'bg-slate-100 border-slate-300'
                        }`}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={14} color="#ffffff" />
                        ) : (
                          <Text
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {st.number}
                          </Text>
                        )}
                      </View>
                      <Text
                        className={`text-[10px] font-medium mt-1 ${
                          isActive || isCompleted ? 'text-slate-900 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {st.title}
                      </Text>
                    </View>

                    {idx !== steps.length - 1 && (
                      <View
                        className={`flex-1 h-[2px] mx-1 ${
                          isCompleted ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>

            {/* 2. Résumé de la commande Card */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-sm font-bold text-slate-900 mb-3">
                Résumé de la commande
              </Text>

              {/* Restaurant Meta */}
              <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <View className="flex-row items-center flex-1 mr-2">
                  <Image
                    source={{ uri: orderSummary.restaurantLogo }}
                    className="w-10 h-10 rounded-full border border-slate-200 mr-2.5"
                    resizeMode="contain"
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900">
                      {orderSummary.restaurantName}
                    </Text>
                    <Text className="text-[11px] font-medium text-emerald-700">
                      👥 {orderSummary.groupInfo}
                    </Text>
                    <Text className="text-[11px] text-slate-500">
                      ⏱ {orderSummary.deliveryInfo}
                    </Text>
                  </View>
                </View>
                <Image
                  source={ASSETS.pizzaCover}
                  className="w-14 h-14 rounded-xl"
                  resizeMode="cover"
                />
              </View>

              {/* Ordered Items List */}
              <View className="space-y-1.5 pb-3 border-b border-slate-100 mb-3">
                {orderSummary.items.map((item, i) => (
                  <View key={i} className="flex-row items-center justify-between py-0.5">
                    <Text className="text-xs font-medium text-slate-700">{item.name}</Text>
                    <Text className="text-xs font-bold text-slate-900">{item.price} DH</Text>
                  </View>
                ))}
              </View>

              {/* Breakdown Totals */}
              <View className="space-y-1 pb-3 border-b border-slate-100 mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Sous-total</Text>
                  <Text className="text-xs font-bold text-slate-800">{orderSummary.subtotal} DH</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Frais de livraison ⓘ</Text>
                  <Text className="text-xs font-bold text-slate-800">{orderSummary.deliveryFee} DH</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-emerald-600 font-bold">Réduction groupe</Text>
                  <Text className="text-xs font-bold text-emerald-600">-{orderSummary.groupDiscount} DH</Text>
                </View>
              </View>

              {/* Total to Pay */}
              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-sm font-extrabold text-slate-900">Total à payer</Text>
                <Text className="text-xl font-extrabold text-primary">
                  {orderSummary.totalToPay} DH
                </Text>
              </View>
            </View>

            {/* 3. Group Discount Banner */}
            <View className="bg-orange-50/70 border border-orange-200/90 rounded-2xl p-3.5 flex-row items-center justify-between shadow-2xs mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-bold text-slate-900 mb-0.5">
                  {groupDiscountBanner.title}
                </Text>
                <Text className="text-[11px] text-slate-500 font-medium">
                  {groupDiscountBanner.subtitle}
                </Text>
              </View>
              <Text className="text-base font-extrabold text-emerald-600">
                -{groupDiscountBanner.discountAmount} DH
              </Text>
            </View>

            {/* 4. Ta Part (Personal Share) Card */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-sm font-bold text-slate-900 mb-3">Ta part</Text>

              <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: myShare.avatar }}
                    className="w-10 h-10 rounded-full mr-3 border border-slate-200"
                  />
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-xs font-bold text-slate-900 mr-1.5">{myShare.userName}</Text>
                      <View className="bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                        <Text className="text-[9px] font-bold text-emerald-700">{myShare.role}</Text>
                      </View>
                    </View>
                    <Text className="text-[11px] text-slate-400 font-medium">{myShare.itemCountText}</Text>
                  </View>
                </View>

                <Pressable onPress={() => Alert.alert('Détails', 'Détail de votre part')}>
                  <Text className="text-xs font-semibold text-primary">Voir le détail</Text>
                </Pressable>
              </View>

              <View className="space-y-1 pb-3 border-b border-slate-100 mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Sous-total</Text>
                  <Text className="text-xs font-bold text-slate-800">{myShare.subtotal} DH</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-emerald-600 font-bold">Réduction</Text>
                  <Text className="text-xs font-bold text-emerald-600">-{myShare.discount} DH</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-sm font-extrabold text-slate-900">Ta part à payer</Text>
                <Text className="text-xl font-extrabold text-primary">{myShare.shareToPay} DH</Text>
              </View>
            </View>

            {/* 5. Choisir un mode de paiement */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6">
              <Text className="text-sm font-bold text-slate-900 mb-3">
                Choisir un mode de paiement
              </Text>

              <View className="space-y-2.5">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <Pressable
                      key={method.id}
                      onPress={() => handleSelectMethod(method.id)}
                      className={`flex-row items-center justify-between p-3.5 rounded-2xl border ${
                        isSelected
                          ? 'bg-emerald-50/60 border-primary shadow-2xs'
                          : 'bg-white border-slate-200/80'
                      }`}
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                          <Ionicons name={method.icon as any} size={20} color="#334155" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs font-bold text-slate-900">{method.name}</Text>
                          <Text className="text-[11px] text-slate-500 font-medium">{method.subtext}</Text>
                        </View>
                      </View>

                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Vue Paiement Partagé (Right Mockup) */}
            {/* Hero Graphic & Subtitle */}
            <View className="items-center py-4 mb-3">
              {/* Avatars Graphic Stack */}
              <View className="flex-row items-center justify-center mb-3">
                {participants.slice(0, 4).map((p, i) => (
                  <Image
                    key={p.id}
                    source={{ uri: p.avatar }}
                    className="w-12 h-12 rounded-full border-2 border-white -ml-2 shadow-xs"
                  />
                ))}
                <View className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white items-center justify-center -ml-2 shadow-xs">
                  <Text className="text-xs font-extrabold text-emerald-800">+1</Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-slate-900 text-center mb-1">
                Partage automatique
              </Text>
              <Text className="text-xs text-slate-500 text-center px-6 leading-5">
                Chaque participant paie sa part. Tu peux aussi payer pour tout le groupe.
              </Text>
            </View>

            {/* Segmented Control Toggle */}
            <View className="bg-slate-100 p-1.5 rounded-2xl flex-row mb-5 border border-slate-200">
              <Pressable
                onPress={() => setPayForWholeGroup(false)}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  !payForWholeGroup
                    ? 'bg-white border-primary shadow-2xs'
                    : 'border-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    !payForWholeGroup ? 'text-primary' : 'text-slate-600'
                  }`}
                >
                  Chacun paie sa part
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setPayForWholeGroup(true)}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  payForWholeGroup
                    ? 'bg-white border-primary shadow-2xs'
                    : 'border-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    payForWholeGroup ? 'text-primary' : 'text-slate-600'
                  }`}
                >
                  Je paie pour tout le groupe
                </Text>
              </Pressable>
            </View>

            {/* Détails des participants */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
              <Text className="text-sm font-bold text-slate-900 mb-3">
                Détails des participants ({participants.length})
              </Text>

              {participants.map((p, idx) => (
                <View
                  key={p.id}
                  className={`flex-row items-center justify-between py-2.5 ${
                    idx !== participants.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-5 h-5 rounded-full bg-emerald-100 items-center justify-center mr-2">
                      <Text className="text-[10px] font-bold text-emerald-800">{idx + 1}</Text>
                    </View>

                    <Image
                      source={{ uri: p.avatar }}
                      className="w-9 h-9 rounded-full mr-2.5 border border-slate-200"
                    />

                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-xs font-bold text-slate-900 mr-1.5">{p.name}</Text>
                        {p.role === 'Organisateur' && (
                          <View className="bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                            <Text className="text-[9px] font-bold text-emerald-700">Organisateur</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-[10px] text-slate-400 font-medium">{p.itemText}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-xs font-extrabold text-emerald-600">{p.amount} DH</Text>
                    <Text className="text-[10px] font-semibold text-slate-400">{p.status}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Méthode de paiement Card */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                  <Ionicons name="card-outline" size={20} color="#334155" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-slate-900">Carte bancaire</Text>
                  <Text className="text-[11px] text-slate-500 font-medium">•••• •••• •••• 4242</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>

            {/* Security Banner */}
            <View className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 flex-row items-center mb-4">
              <Ionicons name="shield-checkmark" size={20} color="#d97706" style={{ marginRight: 10 }} />
              <View className="flex-1">
                <Text className="text-xs font-bold text-amber-900">Paiement 100% sécurisé</Text>
                <Text className="text-[11px] text-amber-700 leading-4">
                  Nous utilisons un chiffrement de bout en bout pour protéger vos informations.
                </Text>
              </View>
            </View>

            {/* Total Breakdown Group */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6">
              <View className="space-y-1.5 pb-3 border-b border-slate-100 mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Total du groupe</Text>
                  <Text className="text-xs font-bold text-slate-800">
                    {sharedPaymentSummary.groupTotal} DH
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-emerald-600 font-bold">Réduction totale</Text>
                  <Text className="text-xs font-bold text-emerald-600">
                    -{sharedPaymentSummary.totalDiscount} DH
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-1">
                <View>
                  <Text className="text-sm font-extrabold text-slate-900">Total à payer</Text>
                  <Text className="text-[10px] text-slate-400 font-medium">
                    ({sharedPaymentSummary.multiplierText})
                  </Text>
                </View>
                <Text className="text-xl font-extrabold text-primary">
                  {sharedPaymentSummary.totalToPay} DH
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Summary Bar Component */}
      <CartSummaryBar
        totalPrice={
          viewMode === 'shared' || payForWholeGroup
            ? sharedPaymentSummary.totalToPay
            : myShare.shareToPay
        }
        deliveryFee={orderSummary.deliveryFee}
        estimatedTime="20-30 min"
        ctaText={
          viewMode === 'shared' || payForWholeGroup
            ? `Payer le groupe (${sharedPaymentSummary.totalToPay} DH)`
            : `Confirmer & Payer (${myShare.shareToPay} DH)`
        }
        onCtaPress={handleSimulatePayment}
        isLoading={isProcessing}
        iconName="lock-closed"
        subtitleNote={
          viewMode === 'shared' || payForWholeGroup
            ? '✔ En validant, chaque participant sera notifié et la commande sera confirmée.'
            : '🔒 Paiement sécurisé • Vos données sont protégées'
        }
      />
    </View>
  );
}

