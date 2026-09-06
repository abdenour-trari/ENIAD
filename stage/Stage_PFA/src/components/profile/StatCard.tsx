import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileDataType } from '@/services/dataService';

interface StatSectionProps {
  kpis: ProfileDataType['kpis'];
  onHistoryPress?: () => void;
  onPointsPress?: () => void;
  onSavingsPress?: () => void;
}

export const StatSection: React.FC<StatSectionProps> = ({
  kpis,
  onHistoryPress,
  onPointsPress,
  onSavingsPress,
}) => {
  return (
    <View className="flex-row justify-between px-5 mb-5 space-x-3">
      {/* Card 1: Commandes */}
      <Pressable
        onPress={onHistoryPress}
        className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs items-center justify-between mr-1"
      >
        <Ionicons name="bag-handle" size={24} color="#16a34a" style={{ marginBottom: 4 }} />
        <Text className="text-xl font-extrabold text-slate-900">{kpis.totalOrders}</Text>
        <Text className="text-[11px] font-medium text-slate-500 mb-1">Commandes</Text>
        <Text className="text-[10px] font-bold text-primary">voir l'historique &gt;</Text>
      </Pressable>

      {/* Card 2: Points */}
      <Pressable
        onPress={onPointsPress}
        className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs items-center justify-between mx-1"
      >
        <Ionicons name="star" size={24} color="#f59e0b" style={{ marginBottom: 4 }} />
        <Text className="text-xl font-extrabold text-slate-900">
          {kpis.points.toLocaleString()}
        </Text>
        <Text className="text-[11px] font-medium text-slate-500 mb-1">Points Jiblina</Text>
        <Text className="text-[10px] font-bold text-primary">voir mes points &gt;</Text>
      </Pressable>

      {/* Card 3: Économies */}
      <Pressable
        onPress={onSavingsPress}
        className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs items-center justify-between ml-1"
      >
        <Ionicons name="wallet" size={24} color="#16a34a" style={{ marginBottom: 4 }} />
        <Text className="text-xl font-extrabold text-slate-900">{kpis.savingsDH} <Text className="text-xs font-bold text-slate-700">DH</Text></Text>
        <Text className="text-[11px] font-medium text-slate-500 mb-1">Économies</Text>
        <Text className="text-[10px] font-bold text-primary">voir détails &gt;</Text>
      </Pressable>
    </View>
  );
};
