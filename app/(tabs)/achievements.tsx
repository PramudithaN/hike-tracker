// app/tabs/achievements.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store';
import { fetchUserAchievements } from '@/lib/supabase/queries';
import { ACHIEVEMENT_DEFS } from '@/lib/utils/achievements';
import type { Achievement } from '@/types';

export default function AchievementsScreen() {
  const user = useAuthStore((s) => s.user);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchUserAchievements(user.id)
      .then((list: Achievement[]) => setEarned(new Set(list.map((a) => a.key))))
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
      <Text style={styles.title}>Badges</Text>
      <Text style={styles.sub}>{earned.size} / {ACHIEVEMENT_DEFS.length} earned</Text>
      <FlatList
        data={ACHIEVEMENT_DEFS}
        keyExtractor={(a) => a.key}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <BadgeCard
            emoji={item.emoji}
            title={item.title}
            description={item.description}
            unlocked={earned.has(item.key)}
          />
        )}
      />
    </View>
  );
}

function BadgeCard({
  emoji, title, description, unlocked,
}: {
  readonly emoji: string;
  readonly title: string;
  readonly description: string;
  readonly unlocked: boolean;
}) {
  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>{emoji}</Text>
      <Text style={[styles.cardTitle, !unlocked && styles.textLocked]}>{title}</Text>
      <Text style={[styles.cardDesc, !unlocked && styles.textLocked]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e1a', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2e1a' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', paddingHorizontal: 20 },
  sub: { color: '#5a7a5a', fontSize: 13, paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  grid: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    flex: 1, backgroundColor: '#0f1f0f', borderRadius: 14, padding: 16, alignItems: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: '#2d5a27',
  },
  cardLocked: { borderColor: '#1f2f1f', opacity: 0.5 },
  emoji: { fontSize: 32, marginBottom: 8 },
  emojiLocked: { opacity: 0.4 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  cardDesc: { color: '#5a7a5a', fontSize: 11, textAlign: 'center', marginTop: 4 },
  textLocked: { color: '#3a5a3a' },
});
