// app/tabs/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';
import { fetchUserProfile } from '@/lib/supabase/queries';
import type { UserProfile } from '@/types';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchUserProfile(user.id)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7ec87e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#7ec87e" />
        </View>
        <Text style={styles.username}>{profile?.username ?? user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Hikes" value={String(profile?.total_hikes ?? 0)} icon="trail-sign" />
        <StatCard
          label="Distance"
          value={`${(profile?.total_distance_km ?? 0).toFixed(1)} km`}
          icon="navigate"
        />
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#e57373" />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ label, value, icon }: Readonly<{ label: string; value: string; icon: string }>) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color="#7ec87e" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e1a', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2e1a' },
  avatarRow: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#0f1f0f',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 2, borderColor: '#2d5a27',
  },
  username: { color: '#fff', fontSize: 20, fontWeight: '700' },
  email: { color: '#5a7a5a', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 32 },
  statCard: {
    flex: 1, backgroundColor: '#0f1f0f', borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#2d5a27',
  },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 6 },
  statLabel: { color: '#5a7a5a', fontSize: 12, marginTop: 2 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, padding: 16, borderRadius: 12, backgroundColor: '#1f0f0f',
    borderWidth: 1, borderColor: '#5a2020',
  },
  signOutText: { color: '#e57373', fontSize: 15, fontWeight: '600' },
});
