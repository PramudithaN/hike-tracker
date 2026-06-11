// lib/supabase/client.ts
import { Platform } from 'react-native';
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
  auth: {
    detectSessionInUrl: Platform.OS === 'web',
    persistSession: true,
    autoRefreshToken: true,
  },
});
