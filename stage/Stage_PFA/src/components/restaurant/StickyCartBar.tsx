import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store';

interface StickyCartBarProps {
  itemCount: number;
  totalPrice: number;
  onPressCart: () => void;
  onContinue: () => void;
}

/**
 * Sticky Footer Cart Bar with micro-animated badge scaling on optimistic add-to-cart.
 */
export const StickyCartBar: React.FC<StickyCartBarProps> = ({
  itemCount,
  totalPrice,
  onPressCart,
  onContinue,
}) => {
  const pulseSignal = useCartStore((state) => state.pulseSignal);
  const badgeScale = useRef(new Animated.Value(1)).current;

  // Trigger scale bounce animation whenever pulseSignal or itemCount updates
  useEffect(() => {
    if (itemCount > 0) {
      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.35,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1.0,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [pulseSignal, itemCount]);

  if (itemCount <= 0) return null;

  return (
    <View className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-3 flex-row items-center justify-between border border-slate-200/90 shadow-xl z-40">
      {/* Left Bag Icon & Cart Summary */}
      <Pressable onPress={onPressCart} className="flex-row items-center flex-1 mr-3">
        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 mr-3 relative">
          <Ionicons name="bag-handle-outline" size={20} color="#16a34a" />

          {/* Micro-animated Badge */}
          <Animated.View
            style={{ transform: [{ scale: badgeScale }] }}
            className="absolute -top-1 -right-1 bg-emerald-600 w-5 h-5 rounded-full items-center justify-center border border-white"
          >
            <Text className="text-[10px] font-extrabold text-white">{itemCount}</Text>
          </Animated.View>
        </View>

        <View>
          <Text className="text-xs font-bold text-slate-900">Voir le panier</Text>
          <Text className="text-xs font-medium text-slate-500">
            {itemCount} article{itemCount > 1 ? 's' : ''} • {totalPrice} DH
          </Text>
        </View>
      </Pressable>

      {/* Right Continue Button */}
      <Pressable
        onPress={onContinue}
        className="bg-primary active:bg-primary-700 px-6 py-3 rounded-xl shadow-xs"
      >
        <Text className="text-xs font-bold text-white">Continuer</Text>
      </Pressable>
    </View>
  );
};

export default StickyCartBar;
