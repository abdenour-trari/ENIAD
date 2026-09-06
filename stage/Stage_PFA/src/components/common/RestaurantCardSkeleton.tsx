import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

/**
 * Skeleton loader matching restaurant card layout.
 */
export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs mb-4">
      {/* Cover Banner Image Skeleton */}
      <Skeleton width="100%" height={128} borderRadius={0} />

      {/* Restaurant Header Details Skeleton */}
      <View className="p-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          {/* Logo Avatar Skeleton */}
          <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />

          {/* Title & Stats */}
          <View className="flex-1">
            <Skeleton height={16} width="60%" borderRadius={6} className="mb-2" />
            <Skeleton height={12} width="45%" borderRadius={4} className="mb-2" />
            <Skeleton height={12} width="80%" borderRadius={4} />
          </View>
        </View>

        {/* Chevron Icon Skeleton */}
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

export default RestaurantCardSkeleton;
