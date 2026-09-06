import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

/**
 * Skeleton loader matching product / food dish card layout.
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs mb-3 flex-row items-center justify-between">
      {/* Image Thumbnail Skeleton */}
      <Skeleton width={80} height={80} borderRadius={16} className="mr-3" />

      {/* Text Info Skeleton */}
      <View className="flex-1 mr-2 justify-between h-20 py-0.5">
        <View>
          {/* Title */}
          <Skeleton height={16} width="65%" borderRadius={6} className="mb-2" />
          {/* Restaurant Subtitle */}
          <Skeleton height={12} width="40%" borderRadius={4} className="mb-2" />
          {/* Description line */}
          <Skeleton height={11} width="90%" borderRadius={4} />
        </View>

        {/* Price Badge */}
        <Skeleton height={16} width="30%" borderRadius={6} />
      </View>

      {/* Action Chevron Skeleton */}
      <Skeleton width={32} height={32} borderRadius={16} />
    </View>
  );
};

export default ProductCardSkeleton;
