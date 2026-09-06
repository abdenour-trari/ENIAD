import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface AnimatedDeliveryMapProps {
  targetLocation: LatLng;
  restaurantLocation?: LatLng;
  destinationLocation?: LatLng;
  estimatedTimeText?: string;
  distanceText?: string;
  restaurantLogo?: string;
  isGpsSignalLost?: boolean;
  lastKnownTimestamp?: string;
  lastKnownLocationText?: string;
  onRetryGps?: () => void;
}

/**
 * AnimatedDeliveryMap Component.
 * Features:
 * - 60fps smooth marker coordinate interpolation using Animated.timing (eliminates sudden jumps)
 * - Clear "Signal GPS perdu" state overlay displaying last known position, timestamp, and retry CTA
 */
export const AnimatedDeliveryMap: React.FC<AnimatedDeliveryMapProps> = ({
  targetLocation,
  restaurantLocation = { latitude: 34.922, longitude: -2.325 },
  destinationLocation = { latitude: 34.928, longitude: -2.312 },
  estimatedTimeText = '18 min',
  distanceText = '1.2 km',
  restaurantLogo,
  isGpsSignalLost = false,
  lastKnownTimestamp = '13:04:15',
  lastKnownLocationText = 'Avenue Hassan II (~600m de vous)',
  onRetryGps,
}) => {
  // Store previous location for smooth interpolation
  const [prevLocation, setPrevLocation] = useState<LatLng>(targetLocation);
  const [currentLocation, setCurrentLocation] = useState<LatLng>(targetLocation);

  // Animated progress value (0 to 1) for GPS interpolation
  const animProgress = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Whenever targetLocation changes (new GPS update received), interpolate fluidly over 2500ms
  useEffect(() => {
    setPrevLocation(currentLocation);
    animProgress.setValue(0);

    Animated.timing(animProgress, {
      toValue: 1,
      duration: 2500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setCurrentLocation(targetLocation);
      }
    });
  }, [targetLocation.latitude, targetLocation.longitude]);

  // Continuous pulse animation on driver marker ring
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Interpolated animated 2D coordinates for smooth marker movement
  const leftPercent = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `${Math.max(15, Math.min(80, (prevLocation.longitude + 2.33) * 1000))}%`,
      `${Math.max(15, Math.min(80, (targetLocation.longitude + 2.33) * 1000))}%`,
    ],
  });

  const topPercent = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `${Math.max(20, Math.min(75, (34.935 - prevLocation.latitude) * 2500))}%`,
      `${Math.max(20, Math.min(75, (34.935 - targetLocation.latitude) * 2500))}%`,
    ],
  });

  return (
    <View className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-200 shadow-sm">
      {/* Map Background Canvas (Grayscale when signal lost) */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop',
        }}
        className={`w-full h-full ${isGpsSignalLost ? 'opacity-30 grayscale' : 'opacity-60'}`}
        resizeMode="cover"
      />

      {/* Polyline Route Overlay */}
      <View className="absolute inset-0 items-center justify-center">
        <View
          className={`w-52 h-36 border-l-4 border-b-4 border-dashed rounded-bl-3xl -rotate-12 ${
            isGpsSignalLost ? 'border-amber-400 opacity-40' : 'border-emerald-600'
          }`}
        />
      </View>

      {/* Restaurant Marker */}
      <View className="absolute bottom-8 left-8 bg-slate-900 p-2 rounded-full border-2 border-white shadow-md items-center justify-center">
        {restaurantLogo ? (
          <Image source={{ uri: restaurantLogo }} className="w-7 h-7 rounded-full" resizeMode="contain" />
        ) : (
          <Ionicons name="restaurant" size={16} color="#ffffff" />
        )}
      </View>

      {/* Destination Marker */}
      <View className="absolute top-6 right-8 bg-white px-3 py-1.5 rounded-2xl shadow-lg border border-slate-200 flex-row items-center">
        <Ionicons name="home" size={16} color="#16a34a" style={{ marginRight: 6 }} />
        <View>
          <Text className="text-xs font-bold text-slate-900">ENIAD</Text>
          <Text className="text-[9px] text-slate-500 font-medium">Berkane</Text>
        </View>
      </View>

      {/* Floating ETA Pill */}
      {!isGpsSignalLost && (
        <Animated.View
          style={{ left: leftPercent, top: topPercent }}
          className="-mt-9 -ml-12 bg-white/95 px-2.5 py-1 rounded-full shadow-md border border-emerald-200 flex-row items-center space-x-1"
        >
          <Ionicons name="flash" size={12} color="#16a34a" />
          <Text className="text-[10px] font-extrabold text-emerald-800 ml-1">
            {estimatedTimeText} • {distanceText}
          </Text>
        </Animated.View>
      )}

      {/* Fluidly Interpolated Driver Marker */}
      <Animated.View
        style={{
          left: leftPercent,
          top: topPercent,
        }}
        className="absolute items-center justify-center z-20"
      >
        {/* Animated Pulse Ring */}
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className={`absolute w-12 h-12 rounded-full border ${
            isGpsSignalLost
              ? 'bg-amber-500/20 border-amber-400'
              : 'bg-emerald-500/30 border-emerald-400'
          }`}
        />

        {/* Scooter Icon Marker */}
        <View
          className={`p-2.5 rounded-full border-2 border-white shadow-xl items-center justify-center ${
            isGpsSignalLost ? 'bg-amber-600' : 'bg-emerald-600'
          }`}
        >
          <Ionicons
            name={isGpsSignalLost ? 'warning-outline' : 'bicycle'}
            size={20}
            color="#ffffff"
          />
        </View>
      </Animated.View>

      {/* Signal GPS Perdu Clear Overlay State */}
      {isGpsSignalLost && (
        <View className="absolute inset-0 bg-slate-950/80 p-4 justify-between z-30">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 items-center justify-center mr-2.5">
                <Ionicons name="wifi-outline" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-white">
                  Signal GPS interrompu 🛰️
                </Text>
                <Text className="text-[10px] text-amber-300 font-semibold">
                  Aucune mise à jour depuis {'>'} 10 secondes
                </Text>
              </View>
            </View>

            <View className="bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-400/50">
              <Text className="text-[9px] font-bold text-amber-200">SIGNAL PERDU</Text>
            </View>
          </View>

          {/* Last Known Position & Timestamp Callout */}
          <View className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3">
            <Text className="text-xs font-bold text-amber-100 mb-1">
              📍 Dernière position connue :
            </Text>
            <Text className="text-xs text-slate-300 font-medium">
              {lastKnownLocationText}
            </Text>
            <Text className="text-[10px] font-semibold text-slate-400 mt-1">
              Dernier signal reçu à : <Text className="font-extrabold text-white">{lastKnownTimestamp}</Text>
            </Text>
          </View>

          {/* Retry Action */}
          <Pressable
            onPress={onRetryGps}
            className="w-full py-2.5 rounded-xl bg-amber-500 active:bg-amber-600 items-center justify-center flex-row shadow-sm"
          >
            <Ionicons name="refresh-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text className="text-xs font-extrabold text-white">
              Reconnecter le signal GPS 🔄
            </Text>
          </Pressable>
        </View>
      )}

      {/* Target Location Recenter Button */}
      {!isGpsSignalLost && (
        <Pressable className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white items-center justify-center shadow-md border border-slate-200 active:bg-slate-100">
          <Ionicons name="locate" size={20} color="#16a34a" />
        </Pressable>
      )}
    </View>
  );
};

export default AnimatedDeliveryMap;
