import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface LoyaltyPointsToastProps {
  visible: boolean;
  pointsEarned: number;
  message?: string;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

/**
 * Animated LoyaltyPointsToast Component.
 * Triggered right after order validation in the order confirmation flow.
 * Displays earned loyalty points (+89 pts) with smooth slide & scale spring animations.
 */
export const LoyaltyPointsToast: React.FC<LoyaltyPointsToastProps> = ({
  visible,
  pointsEarned,
  message,
  onDismiss,
  autoHideDuration = 4500,
}) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const starPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Slide down and scale up spring animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 20,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation on star icon
      const starLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(starPulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(starPulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      starLoop.start();

      // Auto dismiss timer
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      return () => {
        starLoop.stop();
        clearTimeout(timer);
      };
    } else {
      slideAnim.setValue(-120);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
      className="absolute top-12 left-4 right-4 z-50 bg-slate-950 border border-amber-400/60 rounded-3xl p-4 shadow-2xl flex-row items-center justify-between"
    >
      {/* Left Icon & Message */}
      <View className="flex-row items-center flex-1 mr-2">
        <Animated.View
          style={{ transform: [{ scale: starPulseAnim }] }}
          className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/50 items-center justify-center mr-3"
        >
          <Ionicons name="star" size={22} color="#f59e0b" />
        </Animated.View>

        <View className="flex-1">
          <View className="flex-row items-center space-x-1 mb-0.5">
            <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Commande Confirmée 🎉
            </Text>
          </View>

          <Text className="text-sm font-extrabold text-white">
            +{pointsEarned} points de fidélité gagnés !
          </Text>

          <Text className="text-[11px] font-medium text-amber-300/90 mt-0.5" numberOfLines={1}>
            {message || 'Vos points ont été ajoutés à votre compte Jiblina'}
          </Text>
        </View>
      </View>

      {/* Dismiss Action */}
      <Pressable
        onPress={handleClose}
        hitSlop={8}
        className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 items-center justify-center"
      >
        <Ionicons name="close" size={16} color="#94a3b8" />
      </Pressable>
    </Animated.View>
  );
};

export default LoyaltyPointsToast;
