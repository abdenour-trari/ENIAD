import * as Linking from 'expo-linking';
import { Share } from 'react-native';

export const DEEP_LINK_SCHEME = 'jiblina';

/**
 * Generates an Expo Router deep link URL for a group order invitation.
 * E.g. jiblina://group-order/g_pizzahut_1
 */
export function generateGroupOrderDeepLink(groupId: string): string {
  return Linking.createURL(`group-order/${groupId}`);
}

/**
 * Triggers native system share dialog with deep link invitation text using expo-linking / React Native Share.
 */
export async function shareGroupOrderInvitation(
  groupId: string,
  restaurantName: string = 'Pizza Hut',
  discountPercentage: number = 25
): Promise<boolean> {
  const deepLink = generateGroupOrderDeepLink(groupId);
  const message = `Rejoins ma commande collective Jiblina chez ${restaurantName} ! 🍔\nÉconomisons -${discountPercentage}% ensemble sur la commande.\n\n👉 Cliquez pour rejoindre : ${deepLink}`;

  try {
    const result = await Share.share({
      message,
      url: deepLink,
      title: `Commande collective ${restaurantName}`,
    });
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing deep link:', error);
    return false;
  }
}
