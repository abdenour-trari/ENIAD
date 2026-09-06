import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Custom Bottom Tabs Layout matching the exact mockup design:
 * - Accueil active tab with yellow pill
 * - Center elevated golden shopping bag button
 * - Clean labels & icons
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#334155',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center rounded-full ${
                focused ? 'bg-[#FBBF24] px-4 py-1.5' : ''
              }`}
              style={focused ? { width: 54, height: 32 } : {}}
            >
              <View
                className={`items-center justify-center rounded-full ${
                  focused ? 'bg-white w-6 h-6' : ''
                }`}
              >
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={focused ? 15 : 22}
                  color={focused ? '#D97706' : '#94a3b8'}
                />
              </View>
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '700' : '500',
                color: focused ? '#1e293b' : '#94a3b8',
                marginTop: focused ? 2 : 0,
              }}
            >
              Accueil
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: '',
          tabBarIcon: () => (
            <View
              className="w-14 h-14 rounded-full items-center justify-center -mt-6 border-4 border-white shadow-lg"
              style={{ backgroundColor: '#FBBF24' }}
            >
              <Ionicons name="bag-handle" size={24} color="#1e293b" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, focused }) => (
            <View className="relative">
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={22}
                color={color}
              />
              <View
                className="absolute -top-1 -right-1 bg-red-500 rounded-full border border-white"
                style={{ width: 8, height: 8 }}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
