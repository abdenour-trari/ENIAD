import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, CartItem } from '@/store/useAppStore';
import { useCartStore } from '@/store/useCartStore';
import { useNetworkStore } from '@/store/useNetworkStore';
import { ASSETS } from '@/assets';
import { dataService } from '@/services/dataService';
import { usePrefetch } from '@/hooks';
import { CartSummaryBar, EmptyState } from '@/components';

/**
 * Pixel-Perfect Cart Screen matching Jiblina design system.
 * Connects to Zustand store with fallback static demo data and direct checkout flow.
 */
export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Prefetch payment.tsx data immediately upon opening cart screen
  usePrefetch('payment_data', () => dataService.getPaymentData());

  const cart = useAppStore((state) => state.cart);

  const addToCart = useAppStore((state) => state.addToCart);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);

  const isConnected = useNetworkStore((s) => s.isConnected);

  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  // Demo Fallback Items if cart is empty
  const demoItems: CartItem[] = [
    {
      product: {
        id: 'food_1',
        name: 'Margherita',
        description: 'Sauce tomate, mozzarella fraîche, basilic.',
        price: 59,
        unit: 'portion',
        categoryId: 'pizzas',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop',
        rating: 4.8,
        isAvailable: true,
      },
      quantity: 2,
    },
    {
      product: {
        id: 'food_3',
        name: 'Chicken BBQ',
        description: 'Sauce BBQ, poulet grillé, oignons rouges, mozzarella.',
        price: 69,
        unit: 'portion',
        categoryId: 'pizzas',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop',
        rating: 4.7,
        isAvailable: true,
      },
      quantity: 1,
    },
  ];

  const activeCart = cart.length > 0 ? cart : demoItems;

  const subtotal = activeCart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 50 ? 0 : 10;
  const groupDiscount = Math.round(subtotal * 0.25); // 25% collective order discount
  const promoDiscount = promoApplied ? 15 : 0;
  const total = Math.max(0, subtotal + deliveryFee - groupDiscount - promoDiscount);
  const totalItemsCount = activeCart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      Alert.alert('Code Promo', 'Veuillez saisir un code promo.');
      return;
    }
    setPromoApplied(true);
    Alert.alert('Code Promo Appliqué ! 🎉', 'Réduction de 15 DH ajoutée à votre commande.');
  };

  const getItemImage = (id: string) => {
    if (id === 'food_1') return ASSETS.margherita;
    if (id === 'food_3') return ASSETS.burgerCover;
    return ASSETS.pizzaCover;
  };

  return (
    <View className="flex-1 bg-background-offWhite relative">
      {/* Top Header Bar */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
        className="px-4 pb-3 bg-white border-b border-slate-200/80 flex-row items-center justify-between z-10"
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center border border-slate-200"
        >
          <Ionicons name="close" size={20} color="#1e293b" />
        </Pressable>

        <Text className="text-base font-bold text-slate-900">Mon Panier</Text>

        <View className="flex-row items-center">
          <Pressable
            onPress={async () => {
              const res = await useCartStore.getState().syncWithServer();
              if (res.synced) {
                Alert.alert(
                  'Synchronisation serveur 🔄',
                  `Panier fusionné avec le serveur (${res.mergedCount} articles au total).`
                );
              }
            }}
            className="flex-row items-center px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg mr-2"
          >
            <Ionicons name="cloud-upload-outline" size={15} color="#16a34a" style={{ marginRight: 3 }} />
            <Text className="text-[11px] font-bold text-emerald-700">Synchro</Text>
          </Pressable>

          {cart.length > 0 ? (
            <Pressable onPress={clearCart} className="px-1">
              <Text className="text-xs font-semibold text-red-500">Vider</Text>
            </Pressable>
          ) : (
            <View className="w-4" />
          )}
        </View>

      </View>

      {activeCart.length === 0 ? (
        <EmptyState
          title="Votre panier est vide"
          description="Découvrez nos délicieux plats et ajoutez vos envies du moment à votre panier."
          iconName="cart-outline"
          ctaText="Explorer le catalogue"
          onCtaPress={() => router.push('/search')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: 140 }}
        >

        {/* Offline Cart Indicator */}
        {!isConnected && (
          <View className="flex-row items-center bg-amber-50 border border-amber-300 rounded-2xl px-3.5 py-2 mb-3">
            <Ionicons name="cloud-offline-outline" size={15} color="#d97706" style={{ marginRight: 8 }} />
            <View className="flex-1">
              <Text className="text-[11px] font-bold text-amber-900">
                Panier hors ligne
              </Text>
              <Text className="text-[10px] font-medium text-amber-700">
                Vos modifications seront synchronisées automatiquement au retour en ligne.
              </Text>
            </View>
          </View>
        )}

        {/* Collective Order Restaurant Banner */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex-row items-center justify-between mb-4 shadow-2xs">
          <View className="flex-row items-center flex-1 mr-2">
            <Image
              source={ASSETS.logo}
              className="w-16 h-6 mr-3"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-xs font-bold text-emerald-950">
                Commande collective • Pizza Hut
              </Text>
              <Text className="text-[11px] text-emerald-700 font-medium">
                Réduction de 25% débloquée !
              </Text>
            </View>
          </View>
          <View className="bg-emerald-600 px-2.5 py-1 rounded-lg">
            <Text className="text-[10px] font-extrabold text-white">-25%</Text>
          </View>
        </View>

        {/* Cart Items Section */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
          <Text className="text-sm font-bold text-slate-900 mb-3">
            Articles ({totalItemsCount})
          </Text>

          {activeCart.map((item, index) => (
            <View
              key={item.product.id || index}
              className={`flex-row items-center justify-between py-3 ${
                index !== activeCart.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {/* Item Photo */}
              <Image
                source={getItemImage(item.product.id)}
                className="w-16 h-16 rounded-xl mr-3 bg-slate-100"
                resizeMode="cover"
              />

              {/* Item Details */}
              <View className="flex-1 mr-2">
                <Text className="text-sm font-bold text-slate-900 mb-0.5" numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text className="text-xs text-slate-500 font-medium mb-1">
                  {item.product.price} DH / unité
                </Text>
                <Text className="text-sm font-extrabold text-primary">
                  {item.product.price * item.quantity} DH
                </Text>
              </View>

              {/* Quantity Controls & Delete */}
              <View className="items-end space-y-2">
                <Pressable
                  onPress={() => removeFromCart(item.product.id)}
                  hitSlop={8}
                  className="p-1 mb-1"
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </Pressable>

                <View className="flex-row items-center bg-slate-100 rounded-xl border border-slate-200 p-1 space-x-2">
                  <Pressable
                    onPress={() =>
                      cart.length > 0
                        ? updateQuantity(item.product.id, item.quantity - 1)
                        : null
                    }
                    className="w-6 h-6 rounded-lg bg-white items-center justify-center border border-slate-200 shadow-2xs"
                  >
                    <Ionicons name="remove" size={14} color="#1e293b" />
                  </Pressable>

                  <Text className="text-xs font-bold text-slate-900 min-w-[16px] text-center">
                    {item.quantity}
                  </Text>

                  <Pressable
                    onPress={() =>
                      cart.length > 0
                        ? addToCart(item.product, 1)
                        : null
                    }
                    className="w-6 h-6 rounded-lg bg-primary items-center justify-center shadow-2xs"
                  >
                    <Ionicons name="add" size={14} color="#ffffff" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Code Box */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
          <Text className="text-xs font-bold text-slate-900 mb-2">Code promo</Text>
          <View className="flex-row items-center space-x-2">
            <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mr-2">
              <Ionicons name="pricetag-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
              <TextInput
                className="flex-1 text-xs text-slate-900 font-medium"
                placeholder="Ex: JIBLINA15"
                placeholderTextColor="#94a3b8"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
            </View>
            <Pressable
              onPress={handleApplyPromo}
              className="bg-primary active:bg-primary-700 px-4 py-3 rounded-xl shadow-xs"
            >
              <Text className="text-xs font-bold text-white">Appliquer</Text>
            </Pressable>
          </View>
        </View>

        {/* Bill Summary Breakdown */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6 space-y-2">
          <Text className="text-sm font-bold text-slate-900 mb-2">Récapitulatif</Text>

          <View className="flex-row justify-between py-1">
            <Text className="text-xs text-slate-500 font-medium">Sous-total</Text>
            <Text className="text-xs font-bold text-slate-800">{subtotal} DH</Text>
          </View>

          <View className="flex-row justify-between py-1">
            <Text className="text-xs text-slate-500 font-medium">Frais de livraison</Text>
            <Text className="text-xs font-bold text-emerald-600">
              {deliveryFee === 0 ? 'Offerts 🎉' : `${deliveryFee} DH`}
            </Text>
          </View>

          <View className="flex-row justify-between py-1">
            <Text className="text-xs text-emerald-600 font-bold">Réduction collective (-25%)</Text>
            <Text className="text-xs font-bold text-emerald-600">-{groupDiscount} DH</Text>
          </View>

          {promoApplied && (
            <View className="flex-row justify-between py-1">
              <Text className="text-xs text-emerald-600 font-bold">Code promo JIBLINA15</Text>
              <Text className="text-xs font-bold text-emerald-600">-15 DH</Text>
            </View>
          )}

          <View className="h-[1px] bg-slate-100 my-2" />

          <View className="flex-row justify-between items-baseline pt-1">
            <Text className="text-base font-extrabold text-slate-900">Total général</Text>
            <Text className="text-xl font-extrabold text-primary">{total} DH</Text>
          </View>
        </View>
      </ScrollView>
      )}


      {/* Sticky Bottom Summary Bar Component */}
      {activeCart.length > 0 && (
        <CartSummaryBar
          totalPrice={total}
          deliveryFee={deliveryFee}
          estimatedTime="20-30 min"
          ctaText="Passer la commande"
          onCtaPress={() => router.push('/payment')}
        />
      )}
    </View>
  );
}


