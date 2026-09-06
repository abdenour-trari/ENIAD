import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PromotionsDataType } from '@/services/dataService';

interface UrgentGroupPopUpProps {
  urgentAlert: PromotionsDataType['urgentGroupAlert'];
}

export const UrgentGroupPopUp: React.FC<UrgentGroupPopUpProps> = ({ urgentAlert }) => {
  const router = useRouter();
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // Show urgent pop-up suddenly after 4 seconds delay
    const timer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/70 items-center justify-center p-5 z-50">
      <View className="bg-white rounded-3xl p-5 w-full max-w-sm border-2 border-emerald-500 shadow-2xl items-center relative">
        {/* Close Button */}
        <Pressable
          onPress={() => setVisible(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 items-center justify-center border border-slate-200 z-10"
        >
          <Ionicons name="close" size={18} color="#475569" />
        </Pressable>

        {/* Urgent Icon Badge */}
        <View className="w-14 h-14 rounded-full bg-orange-500 items-center justify-center border-4 border-white shadow-md mb-3 -mt-10">
          <Ionicons name="flash" size={28} color="#ffffff" />
        </View>

        {/* Alert Header */}
        <Text className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">
          ⚡ GROUPE PRESQUE COMPLET !
        </Text>

        <Text className="text-lg font-black text-slate-900 text-center mb-1">
          {urgentAlert.restaurantName}
        </Text>

        <Text className="text-xs font-semibold text-slate-500 text-center mb-3">
          Créé par {urgentAlert.creatorName} • {urgentAlert.alertText}
        </Text>

        {/* Offer Highlight Box */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 w-full flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1 mr-2">
            <Image
              source={{ uri: urgentAlert.restaurantLogo }}
              className="w-10 h-10 rounded-full border border-slate-200 mr-2.5"
              resizeMode="contain"
            />
            <View>
              <Text className="text-xs font-bold text-emerald-950">
                Réduction de groupe
              </Text>
              <Text className="text-xs font-black text-emerald-700">
                {urgentAlert.discountText}
              </Text>
            </View>
          </View>

          <View className="bg-orange-500 px-2.5 py-1 rounded-lg">
            <Text className="text-[10px] font-black text-white">1 Place !</Text>
          </View>
        </View>

        {/* Action Join Button */}
        <Pressable
          onPress={() => {
            setVisible(false);
            router.push({
              pathname: '/group-order',
              params: { groupId: urgentAlert.groupId },
            });
          }}
          className="bg-primary active:bg-primary-700 w-full py-3.5 rounded-2xl items-center shadow-md mb-2"
        >
          <Text className="text-sm font-extrabold text-white">
            Rejoindre le groupe maintenant
          </Text>
        </Pressable>

        <Pressable onPress={() => setVisible(false)}>
          <Text className="text-xs font-semibold text-slate-400">Plus tard</Text>
        </Pressable>
      </View>
    </View>
  );
};
