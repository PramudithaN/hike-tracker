// app/tabs/index.tsx  — Home: stats + recent hikes
import { type ComponentProps, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';
import { fetchRecentHikes, fetchUserProfile } from '@/lib/supabase/queries';
import { formatElapsed } from '@/lib/utils/achievements';
import type { Hike, UserProfile } from '@/types';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchUserProfile(user.id), fetchRecentHikes(user.id)])
      .then(([p, h]) => {
        setProfile(p);
        setHikes(h);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7ec87e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, {profile?.username ?? 'hiker'} 👋</Text>
        <Text style={styles.subtitle}>Ready for your next summit?</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="hiking" label="Total hikes" value={String(profile?.total_hikes ?? 0)} />
        <StatCard
          icon="map-marker-distance"
          label="Distance"
          value={`${(profile?.total_distance_km ?? 0).toFixed(1)} km`}
        />
      </View>

      <Text style={styles.sectionTitle}>Recent hikes</Text>
      {hikes.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="hiking" size={52} color="#2d5a27" />
          <Text style={styles.emptyText}>No hikes yet. Start your first one!</Text>
        </View>
      ) : (
        <FlatList
          data={hikes}
          keyExtractor={(h) => h.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => <HikeRow hike={item} />}
        />
      )}
    </View>
  );
}

function StatCard({ icon, label, value }: Readonly<{ icon: ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string }>) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={24} color="#7ec87e" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HikeRow({ hike }: Readonly<{ hike: Hike }>) {
  const date = new Date(hike.start_time).toLocaleDateString();
  return (
    <View style={styles.hikeRow}>
      <View style={styles.hikeIcon}>
        <MaterialCommunityIcons name="map-marker-path" size={20} color="#7ec87e" />
      </View>
      <View style={styles.hikeInfo}>
        <Text style={styles.hikeDate}>{date}</Text>
        <Text style={styles.hikeStats}>
          {formatElapsed(hike.elapsed_seconds ?? 0)}
          {hike.distance_km == null ? '' : `  ·  ${hike.distance_km.toFixed(2)} km`}
        </Text>
      </View>
      <View style={[styles.hikeBadge, hike.status === 'completed' ? styles.badgeGreen : styles.badgeGrey]}>
        <Text style={styles.hikeBadgeText}>{hike.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e1a', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2e1a' },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  greeting: { color: '#fff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#7ec87e', fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: '#0f1f0f', borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#2d5a27',
  },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 6 },
  statLabel: { color: '#5a7a5a', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: '#7ec87e', fontSize: 13, fontWeight: '600', paddingHorizontal: 20, marginBottom: 10, letterSpacing: 0.8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: '#5a7a5a', fontSize: 14 },
  hikeRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#0f1f0f',
  },
  hikeIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#0f1f0f',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  hikeInfo: { flex: 1 },
  hikeDate: { color: '#fff', fontSize: 14, fontWeight: '600' },
  hikeStats: { color: '#5a7a5a', fontSize: 12, marginTop: 2 },
  hikeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeGreen: { backgroundColor: '#1a3a1a' },
  badgeGrey: { backgroundColor: '#1f1f1f' },
  hikeBadgeText: { color: '#7ec87e', fontSize: 11, fontWeight: '600' },
});
