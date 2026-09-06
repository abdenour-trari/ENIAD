import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChangeText,
}) => {
  return (
    <View className="px-4" style={{ backgroundColor: '#FFD54A', marginTop: -1, paddingBottom: 28 }}>
      <View className="flex-row items-center bg-white rounded-full px-6 shadow-sm" style={{ height: 80 }}>
        <Ionicons name="search-outline" size={33} color="#7E8290" style={{ marginRight: 15 }} />
        <TextInput
          className="flex-1 text-base text-slate-900 font-semibold"
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};
