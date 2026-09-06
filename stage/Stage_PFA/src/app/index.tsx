import { Redirect } from 'expo-router';

/**
 * Root Index Route.
 * Automatically redirects to main Bottom Tabs (Accueil).
 */
export default function RootIndex() {
  return <Redirect href="/(tabs)" />;
}
