import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface UpcomingRewardItem {
  id: string;
  title: string;
  subtitle: string;
  requiredPoints: number;
  iconName: keyof typeof Ionicons.glyphMap;
  category: string;
  discountBadge?: string;
}

export const DEFAULT_UPCOMING_REWARDS: UpcomingRewardItem[] = [
  {
    id: 'u1',
    title: 'Livraison offerte',
    subtitle: 'Valable sur votre prochaine commande chez tous les restaurants',
    requiredPoints: 500,
    iconName: 'bicycle-outline',
    category: 'Livraison',
    discountBadge: 'Frais 0 DH',
  },
  {
    id: 'u2',
    title: 'Réduction -15% Pizza Hut',
    subtitle: 'Applicable sur toutes les pizzas taille Large & Medium',
    requiredPoints: 600,
    iconName: 'pizza-outline',
    category: 'Restaurant',
    discountBadge: '-15%',
  },
  {
    id: 'u3',
    title: 'Dessert offert Le Tacos',
    subtitle: '1 Tiramisu ou Milkshake au choix à l\'achat d\'un menu',
    requiredPoints: 800,
    iconName: 'ice-cream-outline',
    category: 'Dessert',
    discountBadge: 'Gratuit 🍨',
  },
  {
    id: 'u4',
    title: 'Menu Gourmet offert Burger King',
    subtitle: '1 Menu Complete Whopper offert dès 1000 pts cumulés',
    requiredPoints: 1000,
    iconName: 'fast-food-outline',
    category: 'Burger',
    discountBadge: 'Offert 🍔',
  },
];

interface UpcomingRewardsListProps {
  currentPoints: number;
  rewards?: UpcomingRewardItem[];
  onClaimReward?: (reward: UpcomingRewardItem) => void;
}

/**
 * UpcomingRewardsList Component.
 * Displays a list of upcoming rewards with individual progress bars,
 * category badges, and exact remaining points needed to unlock each reward.
 */
export const UpcomingRewardsList: React.FC<UpcomingRewardsListProps> = ({
  currentPoints,
  rewards = DEFAULT_UPCOMING_REWARDS,
  onClaimReward,
}) => {
  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs mb-6">
      {/* Header Title */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center border border-emerald-200">
            <Ionicons name="gift-outline" size={18} color="#16a34a" />
          </View>
          <Text className="text-sm font-bold text-slate-900 ml-2">
            Récompenses à venir
          </Text>
        </View>

        <Text className="text-xs font-semibold text-emerald-700">
          Solde : {currentPoints.toLocaleString()} pts
        </Text>
      </View>

      {/* Rewards List */}
      <View className="space-y-3">
        {rewards.map((reward) => {
          const remainingPoints = Math.max(0, reward.requiredPoints - currentPoints);
          const isUnlocked = remainingPoints === 0;
          const percent = Math.min(100, Math.round((currentPoints / reward.requiredPoints) * 100));

          return (
            <View
              key={reward.id}
              className={`p-3.5 rounded-2xl border ${
                isUnlocked
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              {/* Top Row: Icon, Title, Discount Badge */}
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center mr-3 border ${
                      isUnlocked
                        ? 'bg-emerald-600 border-emerald-700'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Ionicons
                      name={reward.iconName}
                      size={20}
                      color={isUnlocked ? '#ffffff' : '#475569'}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-extrabold text-slate-900 mr-1.5" numberOfLines={1}>
                        {reward.title}
                      </Text>
                      {reward.discountBadge && (
                        <View className="bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                          <Text className="text-[9px] font-bold text-orange-700">
                            {reward.discountBadge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[10px] font-medium text-slate-500" numberOfLines={1}>
                      {reward.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Remaining Points Pill Badge */}
                <View
                  className={`px-2.5 py-1 rounded-xl border ${
                    isUnlocked
                      ? 'bg-emerald-600 border-emerald-700'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-extrabold ${
                      isUnlocked ? 'text-white' : 'text-amber-800'
                    }`}
                  >
                    {isUnlocked ? '🎁 Débloqué !' : `Encore ${remainingPoints} pts`}
                  </Text>
                </View>
              </View>

              {/* Individual Progress Bar */}
              <View className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden mt-1 mb-1">
                <View
                  className={`h-full rounded-full ${
                    isUnlocked ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </View>

              {/* Bottom Target Points Label */}
              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-[10px] font-semibold text-slate-400">
                  Progression : {percent}%
                </Text>
                <Text className="text-[10px] font-extrabold text-slate-700">
                  {reward.requiredPoints} pts requis
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default UpcomingRewardsList;
