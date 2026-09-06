import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface CartSummaryBarProps {
  totalPrice: number;
  deliveryFee?: number;
  estimatedTime?: string;
  ctaText: string;
  onCtaPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  subtitleNote?: string;
}

/**
 * Sticky Bottom Summary Bar component for Cart and Payment screens.
 * NativeWind styled, remaining fixed/sticky over scrolling content.
 * Displays total amount, delivery fee, estimated time, and primary CTA action button.
 */
export const CartSummaryBar: React.FC<CartSummaryBarProps> = ({
  totalPrice,
  deliveryFee = 15,
  estimatedTime = '20-30 min',
  ctaText,
  onCtaPress,
  isLoading = false,
  disabled = false,
  iconName = 'arrow-forward',
  subtitleNote,
}) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200/90 px-4 pt-3 pb-5 shadow-2xl z-50">
      {/* Top Details Row: Total + Delivery & Time */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total à payer
          </Text>
          <Text className="text-xl font-extrabold text-slate-900">
            {totalPrice} DH
          </Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center space-x-1 mb-0.5">
            <Ionicons name="bicycle" size={13} color="#16a34a" />
            <Text className="text-xs font-semibold text-slate-700 ml-1">
              Livraison :{' '}
              <Text className="font-bold text-emerald-700">
                {deliveryFee === 0 ? 'Offerte 🎉' : `${deliveryFee} DH`}
              </Text>
            </Text>
          </View>
          <Text className="text-[11px] font-medium text-slate-500">
            ⏱ Est. {estimatedTime}
          </Text>
        </View>
      </View>

      {/* Main CTA Button */}
      <Pressable
        onPress={onCtaPress}
        disabled={disabled || isLoading}
        className={`w-full py-3.5 rounded-2xl items-center justify-center shadow-xs flex-row ${
          disabled || isLoading
            ? 'bg-slate-300'
            : 'bg-emerald-600 active:bg-emerald-700 shadow-md'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <Text className="text-sm font-extrabold text-white mr-2">
              {ctaText}
            </Text>
            <Ionicons name={iconName} size={18} color="#ffffff" />
          </>
        )}
      </Pressable>

      {/* Optional Disclaimer Note */}
      {subtitleNote && (
        <Text className="text-[10px] font-medium text-slate-400 text-center mt-2">
          {subtitleNote}
        </Text>
      )}
    </View>
  );
};

export default CartSummaryBar;
