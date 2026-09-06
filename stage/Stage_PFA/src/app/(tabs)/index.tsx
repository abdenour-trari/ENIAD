import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  dataService,
  HomeDataType,
  PromotionsDataType,
} from '@/services/dataService';
import {
  HomeHeader,
  SearchBar,
  ActionCards,
  GroupOrderSection,
  PopularFoodSection,
  RestaurantSection,
} from '@/components';

/**
 * Pixel-Perfect Home Screen matching Jiblina mockup design.
 * Connects directly to static JSON dataset via dataService.
 */
export default function HomeScreen() {
  const router = useRouter();
  const [homeData, setHomeData] = useState<HomeDataType | null>(null);
  const [promotionsData, setPromotionsData] = useState<PromotionsDataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const homeRes = await dataService.getHomeData();
        const promoRes = await dataService.getPromotionsData();

        if (homeRes.data) {
          setHomeData(homeRes.data);
        }
        if (promoRes.data) {
          setPromotionsData(promoRes.data);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !homeData) {
    return (
      <View className="flex-1 items-center justify-center bg-background-offWhite">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const {
    userName,
    userLocation,
    search,
    groupOrders,
    popularSandwiches,
    nearbyRestaurants,
  } = homeData;

  return (
    <View className="flex-1 bg-background-offWhite relative">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 1. Header: Greeting + Title + Hero Burger */}
        <HomeHeader
          userName={userName}
          locationName={userLocation.name}
          notificationsCount={userLocation.unreadNotificationsCount}
          onNotificationPress={() => router.push('/notifications')}
        />

        {/* 2. Search Bar */}
        <SearchBar
          placeholder={search.placeholder}
        />

        {/* 3. Action Cards: Create Group / Invite Friends */}
        <ActionCards
          onCreateGroup={() => router.push('/(tabs)/groups')}
          onInviteFriends={() => router.push('/(tabs)/groups')}
        />

        {/* 4. Popular Group Orders (Vertical List) */}
        <GroupOrderSection
          orders={groupOrders as any}
          onJoinOrder={(id: string) =>
            router.push({ pathname: '/group-order', params: { groupId: id } })
          }
          onSeeAllPress={() => router.push('/(tabs)/groups')}
        />

        {/* 5. Popular Sandwiches (Horizontal Scroll) */}
        <PopularFoodSection
          items={popularSandwiches as any}
          onSeeAllPress={() => router.push('/(tabs)/search')}
        />

        {/* 6. Popular Restaurants (Horizontal Scroll with Images) */}
        <RestaurantSection
          restaurants={nearbyRestaurants as any}
          onSelectRestaurant={(id: string) =>
            router.push({ pathname: '/restaurant/[id]', params: { id } })
          }
          onSeeAllPress={() => router.push('/(tabs)/search')}
        />
      </ScrollView>

    </View>
  );
}
