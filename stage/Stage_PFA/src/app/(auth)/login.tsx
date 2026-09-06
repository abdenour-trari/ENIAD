import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ASSETS } from '@/assets';
import { Input, Button } from '@/components/common';
import { loginSchema, LoginFormData } from '@/utils/validation';
import { useAuthStore } from '@/store/useAuthStore';
import { COLORS } from '@/constants/colors';

/**
 * Pixel-Perfect Login Screen (Connexion) matching Jiblina mockup.
 */
export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const insets = useSafeAreaInsets();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setAuthError(null);

    // Identifiants de test fictifs imposés par les consignes
    if (data.email.trim().toLowerCase() === 'test@jiblina.com' && data.password === '123456') {
      login({
        id: 'user_test',
        name: 'Utilisateur Jiblina',
        email: data.email,
        phone: '+212 600 000 000',
        createdAt: new Date().toISOString(),
      });
      router.replace('/(tabs)');
    } else {
      setAuthError('Email ou mot de passe incorrect.\n(Test : test@jiblina.com / 123456)');
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#eaf4eb]"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Top Hero Section */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
        className="items-center pb-4 px-6 bg-[#eaf4eb]"
      >
        {/* Official Brand Logo */}
        <Image
          source={ASSETS.logo}
          className="w-36 h-12"
          resizeMode="contain"
        />

        {/* Hero Image */}
        <Image
          source={ASSETS.loginFriends}
          className="w-full h-44 mt-3"
          resizeMode="contain"
        />
      </View>

      {/* Bottom Sheet White Card */}
      <View className="bg-white rounded-t-[32px] px-6 pt-6 pb-8 flex-1 justify-between shadow-lg">
        <View>
          {/* Header Title */}
          <Text className="text-2xl font-bold text-slate-900 text-center mb-1">
            Bienvenue ! 👋
          </Text>
          <Text className="text-xs text-slate-500 text-center mb-6 px-3 leading-5">
            Connecte-toi pour continuer et profiter des meilleures offres avec tes amis.
          </Text>

          {/* Form Error Banner */}
          {authError && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-xs text-red-600 text-center font-medium">
                {authError}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                iconName="mail-outline"
                placeholder="Adresse e-mail"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                iconName="lock-closed-outline"
                placeholder="Mot de passe"
                isPassword
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          {/* Forgot Password Link */}
          <Pressable
            onPress={() => Alert.alert('Mot de passe oublié', 'Saisissez votre email pour réinitialiser.')}
            className="self-end mb-6"
          >
            <Text className="text-xs font-bold text-primary">
              Mot de passe oublié ?
            </Text>
          </Pressable>

          {/* Submit Button */}
          <Button
            title="Se connecter"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-slate-200" />
            <Text className="mx-3 text-xs text-slate-400 font-medium">
              ou continuer avec
            </Text>
            <View className="flex-1 h-[1px] bg-slate-200" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row justify-between mb-6">
            <Button
              title="Google"
              variant="social"
              icon={
                <View className="w-4 h-4 rounded-full border border-red-500 items-center justify-center">
                  <Text className="text-[10px] font-bold text-red-500">G</Text>
                </View>
              }
              onPress={() => Alert.alert('Google', 'Connexion via Google')}
            />
            <Button
              title="Apple"
              variant="social"
              icon="logo-apple"
              onPress={() => Alert.alert('Apple', 'Connexion via Apple')}
            />
            <Button
              title="Université"
              variant="social"
              icon="school-outline"
              onPress={() => Alert.alert('Université', 'Connexion via votre université')}
            />
          </View>
        </View>

        {/* Footer Link to Register */}
        <View className="flex-row justify-center items-center pt-2">
          <Text className="text-xs text-slate-500 font-medium">
            Pas encore de compte ?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text className="text-xs font-bold text-primary">S'inscrire</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
