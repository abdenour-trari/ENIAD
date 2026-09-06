import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '@/store/useNetworkStore';

/**
 * Animated Offline Mode Banner.
 *
 * Slides in from the top when network is lost, showing a clear
 * "Mode hors ligne" message with icon.
 *
 * When connection is restored, shows a brief "Reconnecté !" success
 * banner before auto-dismissing.
 */
export const OfflineBanner: React.FC = () => {
  const { isConnected, wasOffline } = useNetworkStore();

  const slideAnim = useRef(new Animated.Value(-80)).current;
  const [showReconnected, setShowReconnected] = React.useState(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isConnected) {
      // Slide in offline banner
      setShowReconnected(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else if (wasOffline) {
      // Just reconnected — show success briefly
      setShowReconnected(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();

      reconnectTimerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowReconnected(false);
        });
      }, 3000);
    } else {
      // Connected and was never offline — hide
      slideAnim.setValue(-80);
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [isConnected, wasOffline]);

  // Don't render if never went offline and currently connected
  if (isConnected && !wasOffline && !showReconnected) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY: slideAnim }] }}
      className={`absolute top-0 left-0 right-0 z-50 ${
        showReconnected
          ? 'bg-emerald-700'
          : 'bg-slate-900'
      } px-4 py-2.5 flex-row items-center justify-center shadow-lg`}
    >
      <Ionicons
        name={showReconnected ? 'cloud-done-outline' : 'cloud-offline-outline'}
        size={16}
        color="#ffffff"
        style={{ marginRight: 8 }}
      />

      <Text className="text-xs font-bold text-white">
        {showReconnected
          ? 'Connexion rétablie ! Synchronisation en cours...'
          : 'Mode hors ligne — Le panier reste modifiable'}
      </Text>
    </Animated.View>
  );
};

export default OfflineBanner;
