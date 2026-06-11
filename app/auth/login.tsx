// app/auth/login.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase/client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setError(null);
    if (!email || !password || !username) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;

      if (!data.session) {
        // Email confirmation is required — profile will be created by trigger on confirm
        setError('Account created! Check your email to confirm before signing in.');
        return;
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <MaterialCommunityIcons name="terrain" size={56} color="#7ec87e" style={styles.icon} />
        <Text style={styles.title}>TrailMark</Text>
        <Text style={styles.subtitle}>Track every summit</Text>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signin' && styles.toggleActive]}
            onPress={() => setMode('signin')}
          >
            <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#5a7a5a"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#5a7a5a"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#5a7a5a"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={mode === 'signin' ? handleSignIn : handleSignUp}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>}
        </TouchableOpacity>

        {error && (
          <View style={[styles.errorBox, error.startsWith('Account created') && styles.infoBox]}>
            <MaterialCommunityIcons
              name={error.startsWith('Account created') ? 'email-check-outline' : 'alert-circle-outline'}
              size={16}
              color={error.startsWith('Account created') ? '#7ec87e' : '#ff6b6b'}
            />
            <Text style={[styles.errorText, error.startsWith('Account created') && styles.infoText]}>
              {error}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e1a' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  icon: { alignSelf: 'center', marginBottom: 8 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#7ec87e', fontSize: 15, textAlign: 'center', marginBottom: 36 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#0f1f0f',
    borderRadius: 10,
    marginBottom: 20,
    padding: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: '#2d5a27' },
  toggleText: { color: '#5a7a5a', fontSize: 15 },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    backgroundColor: '#0f1f0f',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d5a27',
  },
  btn: {
    backgroundColor: '#2d5a27',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: { color: '#ff6b6b', fontSize: 13, flex: 1 },
  infoBox: {
    backgroundColor: 'rgba(126,200,126,0.12)',
    borderColor: '#7ec87e',
  },
  infoText: { color: '#7ec87e' },
});
