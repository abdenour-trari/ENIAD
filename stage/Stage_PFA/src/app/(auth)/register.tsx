import React from 'react';
import { View, Text, Image, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ASSETS } from '@/assets';
import { Input, Button } from '@/components/common';
import { registerSchema, RegisterFormData } from '@/utils/validation';
import { useAuthStore } from '@/store/useAuthStore';
import { COLORS } from '@/constants/colors';

/**
 * Pixel-Perfect Register Screen (Inscription) matching Jiblina mockup.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      university: 'Université Hassan II - Casablanca',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });

  const acceptTerms = watch('acceptTerms');

  const onSubmit = (data: RegisterFormData) => {
    login({
      id: `user_${Date.now()}`,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    });

    Alert.alert(
      'Compte créé avec succès !',
      'Bienvenue sur Jiblina !',
      [{ text: 'Continuer', onPress: () => router.replace('/(tabs)') }]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-[#f3faf4]"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header with Back Button & Hero Illustration */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
        className="px-6 pb-2 bg-[#f3faf4]"
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-slate-200"
        >
          <Ionicons name="chevron-back" size={20} color="#1e293b" />
        </Pressable>

        {/* 3D Grocery & Food Illustration */}
        <Image
          source={ASSETS.registerHero}
          className="w-48 h-44 self-center my-1"
          resizeMode="contain"
        />
      </View>

      {/* Bottom Sheet White Card */}
      <View className="bg-white rounded-t-[32px] px-6 pt-6 pb-8 flex-1 justify-between shadow-lg">
        <View>
          {/* Header Title */}
          <Text className="text-2xl font-bold text-slate-900 text-center mb-1">
            Créer un compte
          </Text>
          <Text className="text-xs text-slate-500 text-center mb-6">
            Rejoins la communauté Jiblina !
          </Text>

          {/* Full Name Input */}
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                iconName="person-outline"
                placeholder="Nom complet"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.fullName?.message}
              />
            )}
          />

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

          {/* University Dropdown Field */}
          <Controller
            control={control}
            name="university"
            render={({ field: { onChange, value } }) => (
              <Input
                iconName="school-outline"
                placeholder="Université / École"
                value={value}
                onChangeText={onChange}
                rightElement={
                  <Ionicons name="chevron-down-outline" size={20} color="#6b7280" />
                }
                error={errors.university?.message}
              />
            )}
          />

          {/* Phone Input */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                iconName="call-outline"
                placeholder="Numéro de téléphone"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.phone?.message}
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

          {/* Confirm Password Input */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                iconName="lock-closed-outline"
                placeholder="Confirmer le mot de passe"
                isPassword
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {/* Terms & Conditions Checkbox */}
          <View className="mb-6">
            <Pressable
              onPress={() => setValue('acceptTerms', !acceptTerms)}
              className="flex-row items-start"
            >
              <View
                className={`w-5 h-5 rounded-md border items-center justify-center mr-2.5 mt-0.5 ${
                  acceptTerms ? 'bg-primary border-primary' : 'border-slate-300 bg-white'
                }`}
              >
                {acceptTerms && <Ionicons name="checkmark" size={14} color="#ffffff" />}
              </View>
              <Text className="text-xs text-slate-600 flex-1 leading-4">
                J'accepte les{' '}
                <Text className="font-bold text-primary">Conditions d'utilisation</Text> et la{' '}
                <Text className="font-bold text-primary">Politique de confidentialité</Text>.
              </Text>
            </Pressable>
            {errors.acceptTerms && (
              <Text className="text-xs text-red-500 mt-1 ml-7 font-medium">
                {errors.acceptTerms.message}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title="S'inscrire"
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
              onPress={() => Alert.alert('Google', 'Inscription via Google')}
            />
            <Button
              title="Apple"
              variant="social"
              icon="logo-apple"
              onPress={() => Alert.alert('Apple', 'Inscription via Apple')}
            />
            <Button
              title="Facebook"
              variant="social"
              icon="logo-facebook"
              onPress={() => Alert.alert('Facebook', 'Inscription via Facebook')}
            />
          </View>
        </View>

        {/* Footer Link to Login */}
        <View className="flex-row justify-center items-center pt-2">
          <Text className="text-xs text-slate-500 font-medium">
            Déjà un compte ?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text className="text-xs font-bold text-primary">Se connecter</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
