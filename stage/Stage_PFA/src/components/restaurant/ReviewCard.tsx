import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface CustomerReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  dateText: string;
  comment: string;
}

interface ReviewSectionProps {
  score: number;
  totalReviews: number;
  breakdown: Record<string, number>;
  reviews: CustomerReview[];
  onSeeAllPress?: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  score,
  totalReviews,
  breakdown,
  reviews,
  onSeeAllPress,
}) => {
  return (
    <View className="py-4 px-5 bg-white mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-slate-900">Avis clients</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs font-semibold text-primary">Voir tout</Text>
        </Pressable>
      </View>

      {/* Score & Breakdown Distribution */}
      <View className="flex-row items-center mb-5">
        {/* Left Big Score */}
        <View className="items-start mr-6">
          <Text className="text-4xl font-extrabold text-slate-900 mb-1">{score}</Text>
          <View className="flex-row items-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.floor(score) ? 'star' : 'star-outline'}
                size={14}
                color="#16a34a"
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
          <Text className="text-xs font-medium text-slate-400">({totalReviews} avis)</Text>
        </View>

        {/* Right Star Bars (5 to 1) */}
        <View className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const percent = breakdown[stars] || 5;
            return (
              <View key={stars} className="flex-row items-center">
                <Text className="text-[11px] font-bold text-slate-500 w-3">{stars}</Text>
                <Ionicons name="star" size={10} color="#94a3b8" style={{ marginRight: 6 }} />
                <View className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <View
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Individual Customer Review Cards */}
      {reviews.map((rev) => (
        <View
          key={rev.id}
          className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-2xs"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Image
                source={{ uri: rev.userAvatar }}
                className="w-8 h-8 rounded-full mr-2.5"
              />
              <Text className="text-xs font-bold text-slate-900">{rev.userName}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="flex-row items-center mr-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name="star" size={12} color="#16a34a" style={{ marginRight: 1 }} />
                ))}
              </View>
              <Text className="text-[11px] font-medium text-slate-400">{rev.dateText}</Text>
            </View>
          </View>

          <Text className="text-xs text-slate-700 leading-5">{rev.comment}</Text>
        </View>
      ))}
    </View>
  );
};
