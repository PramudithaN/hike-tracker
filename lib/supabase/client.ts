// lib/supabase/client.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// URL polyfill is only needed on native — importing it on web breaks fetch
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Force the native RN fetch (OkHttp on Android / NSURLSession on iOS)
  // instead of cross-fetch → whatwg-fetch which causes "Network request failed"
  global: {
    fetch: fetch.bind(globalThis),
  },
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: Platform.OS === 'web',
    persistSession: true,
    autoRefreshToken: true,
  },
});
