// app/auth/callback.tsx — handles Supabase email confirmation redirects
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        if (typeof window === 'undefined') return;

        const url = window.location.href;
        const params = new URLSearchParams(
          url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? ''
        );

        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
          // PKCE flow — exchange code for session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (params.get('access_token')) {
          // Implicit flow fallback
          const { error } = await supabase.auth.setSession({
            access_token: params.get('access_token')!,
            refresh_token: params.get('refresh_token')!,
          });
          if (error) throw error;
        } else {
          throw new Error('No auth code or token found in URL.');
        }

        router.replace('/');
      } catch (e: any) {
        setError(e.message ?? 'Confirmation failed.');
      }
    }

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#7ec87e" />
          <Text style={styles.text}>Confirming your account…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e1a', alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { color: '#7ec87e', fontSize: 15 },
  error: { color: '#ff6b6b', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
});
