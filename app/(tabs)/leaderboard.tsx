// app/tabs/leaderboard.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchLeaderboard } from '@/lib/supabase/queries';
import { formatElapsed } from '@/lib/utils/achievements';
import type { LeaderboardEntry } from '@/types';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

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
        <Ionicons name="trophy" size={28} color="#f5c542" />
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No completed hikes yet. Be the first!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(_: LeaderboardEntry, i: number) => String(i)}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }: { item: LeaderboardEntry; index: number }) => (
            <LeaderRow entry={item} rank={index + 1} />
          )}
        />
      )}
    </View>
  );
}

function LeaderRow({ entry, rank }: { readonly entry: LeaderboardEntry; readonly rank: number }) {
  return (
    <View style={[styles.row, rank === 1 && styles.rowFirst]}>
      <Text style={styles.rank}>{MEDAL[rank - 1] ?? `#${rank}`}</Text>
      <View style={styles.info}>
        <Text style={styles.username}>{entry.username}</Text>
        <Text style={styles.sub}>Best: {formatElapsed(entry.best_elapsed_seconds)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.hikes}>{entry.total_hikes}</Text>
        <Text style={styles.hikesLabel}>hikes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e1a', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2e1a' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#5a7a5a', fontSize: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#0f1f0f',
  },
  rowFirst: { backgroundColor: '#1f2e0f' },
  rank: { fontSize: 22, width: 40 },
  info: { flex: 1 },
  username: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sub: { color: '#5a7a5a', fontSize: 12, marginTop: 2 },
  right: { alignItems: 'center' },
  hikes: { color: '#7ec87e', fontSize: 18, fontWeight: '700' },
  hikesLabel: { color: '#5a7a5a', fontSize: 11 },
});
