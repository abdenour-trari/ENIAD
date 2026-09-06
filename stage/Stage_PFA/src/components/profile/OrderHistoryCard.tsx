import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileDataType } from '@/services/dataService';

interface OrderHistoryProps {
  orders: ProfileDataType['recentOrders'];
  onSeeAllPress?: () => void;
  onOrderPress?: (id: string) => void;
}

export const OrderHistorySection: React.FC<OrderHistoryProps> = ({
  orders,
  onSeeAllPress,
  onOrderPress,
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-slate-900">Mes dernières commandes</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir tout</Text>
        </Pressable>
      </View>

      {/* Orders List */}
      <View className="space-y-3">
        {orders.map((ord, idx) => (
          <Pressable
            key={ord.id}
            onPress={() => onOrderPress && onOrderPress(ord.id)}
            className={`flex-row items-center justify-between py-2.5 ${
              idx !== orders.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200 overflow-hidden">
                <Image
                  source={{ uri: ord.restaurantLogo }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-900">{ord.restaurantName}</Text>
                <Text className="text-[11px] text-slate-500 font-medium">{ord.typeText}</Text>
                <Text className="text-[10px] text-slate-400 font-medium">{ord.dateText}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="text-xs font-extrabold text-slate-900 mr-2">
                {ord.amountDH} DH
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
