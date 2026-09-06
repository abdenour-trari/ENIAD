import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'error' | 'success' | 'info';
  onDismiss?: () => void;
  duration?: number;
}

/**
 * Discrete Toast component with smooth NativeWind styling & slide-up animation.
 */
export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'error',
  onDismiss,
  duration = 3500,
}) => {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      dismiss();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 60,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible) return null;


  const bgStyle =
    type === 'error'
      ? 'bg-slate-900 border-red-500/50'
      : type === 'success'
      ? 'bg-slate-900 border-emerald-500/50'
      : 'bg-slate-900 border-slate-700';

  const iconName =
    type === 'error'
      ? 'alert-circle'
      : type === 'success'
      ? 'checkmark-circle'
      : 'information-circle';

  const iconColor = type === 'error' ? '#ef4444' : type === 'success' ? '#16a34a' : '#3b82f6';

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
      className={`absolute bottom-20 left-5 right-5 z-50 rounded-2xl p-3.5 border shadow-2xl flex-row items-center justify-between ${bgStyle}`}
    >
      <View className="flex-row items-center flex-1 mr-2">
        <Ionicons name={iconName} size={20} color={iconColor} style={{ marginRight: 10 }} />
        <Text className="text-xs font-semibold text-white flex-1 leading-4">{message}</Text>
      </View>

      <Pressable onPress={dismiss} hitSlop={8} className="p-1 rounded-full bg-slate-800">
        <Ionicons name="close" size={14} color="#94a3b8" />
      </Pressable>
    </Animated.View>
  );
};

export default Toast;
