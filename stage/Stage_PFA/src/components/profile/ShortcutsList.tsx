import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileDataType } from '@/services/dataService';

interface ShortcutsProps {
  shortcuts: ProfileDataType['shortcuts'];
  onItemPress: (route: string) => void;
}

export const ShortcutsList: React.FC<ShortcutsProps> = ({ shortcuts, onItemPress }) => {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-5">
      <Text className="text-sm font-bold text-slate-900 mb-2">Raccourcis</Text>

      <View className="divide-y divide-slate-100">
        {shortcuts.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onItemPress(item.route)}
            className="flex-row items-center justify-between py-3.5 active:bg-slate-50 rounded-xl px-1"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                <Ionicons name={item.icon as any} size={18} color="#16a34a" />
              </View>
              <Text className="text-xs font-bold text-slate-800">{item.title}</Text>

              {item.badge && (
                <View className="ml-2 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-extrabold text-emerald-800">
                    {item.badge}
                  </Text>
                </View>
              )}
            </View>

            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </Pressable>
        ))}
      </View>
    </View>
  );
};
