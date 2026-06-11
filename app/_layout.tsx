// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store';

export default function RootLayout() {
  const { user, loading, listenToAuthChanges } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = listenToAuthChanges();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inCallback = segments[1] === 'callback';

    // Don't redirect away from the callback screen — it handles its own navigation
    if (inCallback) return;

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/callback" />
      </Stack>
    </>
  );
}
