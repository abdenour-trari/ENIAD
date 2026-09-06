import { Redirect } from 'expo-router';

/**
 * Auth Index Route.
 * Automatically redirects to Login Screen.
 */
export default function AuthIndex() {
  return <Redirect href="/(auth)/login" />;
}
