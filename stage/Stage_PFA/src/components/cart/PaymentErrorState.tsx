import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';

// Zod Schema for Payment Error Code Enum
export const PaymentErrorCodeEnum = z.enum([
  'CARD_DECLINED',
  'INSUFFICIENT_FUNDS',
  'TIMEOUT',
  'NETWORK_ERROR',
  'EXPIRED_CARD',
  'AUTHENTICATION_FAILED',
  'UNKNOWN_ERROR',
]);

export type PaymentErrorCode = z.infer<typeof PaymentErrorCodeEnum>;

// Zod Schema for Payment Error Payload validation
export const PaymentErrorSchema = z.object({
  code: PaymentErrorCodeEnum.catch('UNKNOWN_ERROR'),
  message: z.string().optional(),
  details: z.string().optional(),
  timestamp: z.number().optional(),
});

export type PaymentErrorPayload = z.infer<typeof PaymentErrorSchema>;

export interface ErrorMappingConfig {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
}

// Comprehensive mapping dictionary for user-friendly error messages & suggested actions
export const PAYMENT_ERROR_MAPPINGS: Record<PaymentErrorCode, ErrorMappingConfig> = {
  CARD_DECLINED: {
    title: 'Carte bancaire refusée',
    description: 'Votre banque a décliné le paiement. Veuillez vérifier les informations ou utiliser une autre carte.',
    iconName: 'card-outline',
    primaryActionLabel: 'Changer de moyen de paiement',
    secondaryActionLabel: 'Réessayer',
  },
  INSUFFICIENT_FUNDS: {
    title: 'Solde insuffisant',
    description: 'Le solde de votre compte n’est pas suffisant pour autoriser ce paiement.',
    iconName: 'wallet-outline',
    primaryActionLabel: 'Changer de moyen de paiement',
    secondaryActionLabel: 'Réessayer',
  },
  TIMEOUT: {
    title: 'Délai d’attente dépassé',
    description: 'La réponse du serveur de paiement a pris trop de temps. Aucune somme n’a été débitée.',
    iconName: 'time-outline',
    primaryActionLabel: 'Réessayer le paiement',
    secondaryActionLabel: 'Changer de méthode',
  },
  NETWORK_ERROR: {
    title: 'Problème de connexion réseau',
    description: 'Votre connexion internet semble instable. Veuillez vérifier votre réseau puis réessayez.',
    iconName: 'wifi-outline',
    primaryActionLabel: 'Réessayer',
    secondaryActionLabel: 'Changer de méthode',
  },
  EXPIRED_CARD: {
    title: 'Carte bancaire expirée',
    description: 'La date d’expiration de la carte est dépassée.',
    iconName: 'calendar-outline',
    primaryActionLabel: 'Changer de carte',
    secondaryActionLabel: 'Autre moyen de paiement',
  },
  AUTHENTICATION_FAILED: {
    title: 'Échec de la validation 3D Secure',
    description: 'L’authentification auprès de votre banque n’a pas abouti.',
    iconName: 'shield-discreet-outline' as any,
    primaryActionLabel: 'Réessayer l’authentification',
    secondaryActionLabel: 'Changer de moyen de paiement',
  },
  UNKNOWN_ERROR: {
    title: 'Erreur de traitement du paiement',
    description: 'Une erreur inattendue est survenue lors de la transaction.',
    iconName: 'alert-circle-outline',
    primaryActionLabel: 'Réessayer',
    secondaryActionLabel: 'Changer de moyen de paiement',
  },
};

interface PaymentErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  onChangePaymentMethod?: () => void;
  onDismiss?: () => void;
}

/**
 * Reusable PaymentErrorState component.
 * Uses Zod (`PaymentErrorSchema`) to safely validate runtime error payloads
 * and maps error codes to clear user messages & suggested call-to-actions.
 */
export const PaymentErrorState: React.FC<PaymentErrorStateProps> = ({
  error,
  onRetry,
  onChangePaymentMethod,
  onDismiss,
}) => {
  if (!error) return null;

  // Validate error payload safely with Zod
  const parseResult = PaymentErrorSchema.safeParse(error);
  const validatedPayload: PaymentErrorPayload = parseResult.success
    ? parseResult.data
    : { code: 'UNKNOWN_ERROR', message: typeof error === 'string' ? error : undefined };

  const mapping = PAYMENT_ERROR_MAPPINGS[validatedPayload.code] || PAYMENT_ERROR_MAPPINGS.UNKNOWN_ERROR;

  return (
    <View className="bg-red-50 border border-red-200/90 rounded-2xl p-4 mb-4 shadow-2xs relative">
      {/* Header & Icon */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-9 h-9 rounded-xl bg-red-100 items-center justify-center mr-3 border border-red-200">
            <Ionicons name={mapping.iconName as any || 'alert-circle-outline'} size={20} color="#dc2626" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-red-900 mb-0.5">
              {mapping.title}
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-red-600">
              Code: {validatedPayload.code}
            </Text>
          </View>
        </View>

        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={8} className="p-1 rounded-full bg-red-100">
            <Ionicons name="close" size={16} color="#991b1b" />
          </Pressable>
        )}
      </View>

      {/* Clear User Description */}
      <Text className="text-xs text-red-800 font-medium leading-4 mt-2 mb-3">
        {validatedPayload.message || mapping.description}
      </Text>

      {/* Suggested Actions */}
      <View className="flex-row items-center space-x-2 pt-1 border-t border-red-200/60">
        {onChangePaymentMethod && (
          <Pressable
            onPress={onChangePaymentMethod}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-red-300 items-center justify-center active:bg-red-50"
          >
            <Text className="text-xs font-bold text-red-800" numberOfLines={1}>
              {mapping.primaryActionLabel}
            </Text>
          </Pressable>
        )}

        {onRetry && (
          <Pressable
            onPress={onRetry}
            className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 items-center justify-center active:bg-red-700 shadow-2xs"
          >
            <Text className="text-xs font-bold text-white" numberOfLines={1}>
              {mapping.secondaryActionLabel || 'Réessayer'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default PaymentErrorState;
