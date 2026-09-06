import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { ASSETS } from '@/assets';

export interface GroupOrderData {
  id: string;
  groupName: string;
  groupEmoji: string;
  restaurantName: string;
  membersJoined: number;
  maxMembers: number;
  timeRemainingText: string;
  discountPercentage: number;
  savingsAmount: number;
  distanceText: string;
  deliveryTimeText: string;
  imageKey: string;
  avatars: string[];
  extraAvatarsCount: number;
}

interface GroupOrderSectionProps {
  orders: GroupOrderData[];
  onJoinOrder: (id: string) => void;
  onSeeAllPress?: () => void;
}

export const GroupOrderSection: React.FC<GroupOrderSectionProps> = ({
  orders,
  onJoinOrder,
  onSeeAllPress,
}) => {
  const getImageSource = (key: string) => {
    if (key === 'burgerCover') return ASSETS.burgerCover;
    return ASSETS.pizzaCover;
  };

  return (
    <View className="pt-3 pb-4">
      {/* Section Title */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-[21px] font-extrabold text-slate-900">
          Groupes populaires 🔥
        </Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-sm font-bold" style={{ color: '#F6AA00' }}>Voir tout</Text>
        </Pressable>
      </View>

      {/* Vertical List of Group Orders */}
      <View className="px-4" style={{ gap: 10 }}>
        {orders.map((order) => (
          <View
            key={order.id}
            className="flex-row items-center bg-white rounded-[22px] p-2.5 shadow-sm"
            style={{ minHeight: 108 }}
          >
            {/* Left: Food Image */}
            <Image
              source={getImageSource(order.imageKey)}
              className="rounded-xl"
              style={{ width: 76, height: 86 }}
              resizeMode="cover"
            />

            {/* Middle: Info */}
            <View className="flex-1 ml-3 mr-2">
              {/* Group Name */}
              <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                {order.groupName} {order.groupEmoji}
              </Text>

              {/* Members + Time */}
              <Text className="text-xs text-slate-500 mt-0.5">
                {order.membersJoined}/{order.maxMembers} membres · {order.timeRemainingText}
              </Text>

              {/* Avatars Row */}
              <View className="flex-row items-center mt-1.5">
                {order.avatars.slice(0, 4).map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    className="rounded-full border-2 border-white"
                    style={{
                      width: 22,
                      height: 22,
                      marginLeft: index > 0 ? -6 : 0,
                    }}
                  />
                ))}
                {order.extraAvatarsCount > 0 && (
                  <View
                    className="rounded-full bg-slate-700 items-center justify-center border-2 border-white"
                    style={{ width: 22, height: 22, marginLeft: -6 }}
                  >
                    <Text className="text-white font-bold" style={{ fontSize: 8 }}>
                      +{order.extraAvatarsCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Right: Discount + Join */}
            <View className="items-end" style={{ gap: 6 }}>
              {/* Discount Badge */}
              <View className="rounded-lg px-2 py-1" style={{ backgroundColor: '#dcfce7' }}>
                <Text className="text-xs font-extrabold" style={{ color: '#16a34a' }}>
                  -{order.discountPercentage}%
                </Text>
              </View>

              {/* Savings */}
              <Text className="text-[10px] font-semibold text-slate-500">
                Économise {order.savingsAmount} DH
              </Text>

              {/* Join Button */}
              <Pressable
                onPress={() => onJoinOrder(order.id)}
                className="rounded-full px-5 py-3"
                style={{ backgroundColor: '#6238E7' }}
              >
                <Text className="text-xs font-bold text-white">Rejoindre</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
