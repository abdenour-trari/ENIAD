import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DeliveryStepItem {
  step: number;
  title: string;
  description: string;
  timestamp: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export const DEFAULT_DELIVERY_STEPS: DeliveryStepItem[] = [
  {
    step: 1,
    title: 'Commande confirmée',
    description: 'Le restaurant a reçu ta commande',
    timestamp: '12:45',
    iconName: 'receipt-outline',
  },
  {
    step: 2,
    title: 'En préparation 👨‍🍳',
    description: 'Ton plat est en cours de préparation',
    timestamp: '12:50 • Est. 10 min',
    iconName: 'restaurant-outline',
  },
  {
    step: 3,
    title: 'En route 🛵',
    description: 'Le livreur se déplace vers toi',
    timestamp: '13:05 • Est. 15 min',
    iconName: 'bicycle-outline',
  },
  {
    step: 4,
    title: 'Arrivée & Livrée 🎉',
    description: 'Commande livrée à destination',
    timestamp: '13:15 • Arrivé',
    iconName: 'location-outline',
  },
];

export interface DeliveryTimelineProps {
  steps?: DeliveryStepItem[];
  currentStepIndex: number;
  onStepPress?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Reusable DeliveryTimeline Component.
 * Renders order steps (Préparation -> En route -> Arrivée) with icons,
 * dynamic estimated timestamps, active step highlighting, and smooth transition animations.
 */
export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  steps = DEFAULT_DELIVERY_STEPS,
  currentStepIndex,
  onStepPress,
  orientation = 'horizontal',
}) => {
  // Animated values for smooth active step highlighting transition
  const activeScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Trigger pop/scale spring animation whenever currentStepIndex changes
    activeScaleAnim.setValue(0.7);
    Animated.spring(activeScaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Continuous pulse loop on the active node
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [currentStepIndex, activeScaleAnim, pulseAnim]);

  if (orientation === 'vertical') {
    return (
      <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
        <Text className="text-sm font-bold text-slate-900 mb-4">
          Étapes de la livraison
        </Text>

        {steps.map((st, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <Pressable
              key={st.step}
              onPress={() => onStepPress && onStepPress(idx)}
              className="flex-row items-start mb-4 relative"
            >
              {/* Vertical Connector Line */}
              {idx !== steps.length - 1 && (
                <View
                  className={`absolute left-[15px] top-8 bottom-0 w-[2.5px] ${
                    idx < currentStepIndex ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Icon Node Node with Spring Scale Animation */}
              <View className="items-center justify-center mr-3 z-10">
                {isActive ? (
                  <Animated.View
                    style={{ transform: [{ scale: Animated.multiply(activeScaleAnim, pulseAnim) }] }}
                    className="w-8 h-8 rounded-full bg-emerald-600 items-center justify-center border-2 border-emerald-300 shadow-md"
                  >
                    <Ionicons name={st.iconName} size={16} color="#ffffff" />
                  </Animated.View>
                ) : (
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center border ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    ) : (
                      <Ionicons name={st.iconName} size={15} color="#94a3b8" />
                    )}
                  </View>
                )}
              </View>

              {/* Text Details */}
              <View className="flex-1 flex-row items-start justify-between bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                <View className="flex-1 mr-2">
                  <Text
                    className={`text-xs ${
                      isActive
                        ? 'font-extrabold text-emerald-900'
                        : isCompleted
                        ? 'font-bold text-slate-800'
                        : 'font-medium text-slate-400'
                    }`}
                  >
                    {st.title} {isActive && '●'}
                  </Text>
                  <Text className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {st.description}
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-[10px] ${
                      isActive ? 'font-bold text-emerald-700' : 'font-semibold text-slate-400'
                    }`}
                  >
                    {st.timestamp}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Horizontal Timeline Layout
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Avancement de la livraison
        </Text>
        <View className="flex-row items-center space-x-1">
          <View className="w-2 h-2 rounded-full bg-emerald-500" />
          <Text className="text-[10px] font-bold text-emerald-700 ml-1">En direct</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-1">
        {steps.map((st, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <React.Fragment key={st.step}>
              <Pressable
                onPress={() => onStepPress && onStepPress(idx)}
                className="items-center flex-1"
              >
                {/* Step Circle Node with Active Spring Animation */}
                {isActive ? (
                  <Animated.View
                    style={{ transform: [{ scale: Animated.multiply(activeScaleAnim, pulseAnim) }] }}
                    className="w-8 h-8 rounded-full bg-emerald-600 items-center justify-center border-2 border-emerald-300 shadow-md"
                  >
                    <Ionicons name={st.iconName} size={15} color="#ffffff" />
                  </Animated.View>
                ) : (
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center border ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={13} color="#ffffff" />
                    ) : (
                      <Ionicons name={st.iconName} size={13} color="#94a3b8" />
                    )}
                  </View>
                )}

                {/* Step Title */}
                <Text
                  numberOfLines={1}
                  className={`text-[10px] mt-1.5 text-center ${
                    isActive
                      ? 'font-extrabold text-emerald-800'
                      : isCompleted
                      ? 'font-bold text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  {st.title}
                </Text>

                {/* Step Timestamp */}
                <Text className="text-[9px] text-slate-400 text-center font-medium">
                  {st.timestamp}
                </Text>
              </Pressable>

              {/* Connecting Bar */}
              {idx !== steps.length - 1 && (
                <View
                  className={`h-[2.5px] -mt-5 flex-1 mx-0.5 rounded-full ${
                    idx < currentStepIndex ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default DeliveryTimeline;
