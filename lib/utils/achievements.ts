// lib/utils/achievements.ts
import { insertAchievement } from '@/lib/supabase/queries';
import type { Hike, UserProfile } from '@/types';

export interface AchievementDef {
  key: string;
  emoji: string;
  title: string;
  description: string;
  check: (hike: Hike, profile: UserProfile) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    key: 'first_hike',
    emoji: '🥾',
    title: 'First Steps',
    description: 'Complete your first hike',
    check: (_hike, profile) => profile.total_hikes >= 1,
  },
  {
    key: 'five_hikes',
    emoji: '🌿',
    title: 'Trail Regular',
    description: 'Complete 5 hikes',
    check: (_hike, profile) => profile.total_hikes >= 5,
  },
  {
    key: 'ten_hikes',
    emoji: '🏔️',
    title: 'Mountain Goat',
    description: 'Complete 10 hikes',
    check: (_hike, profile) => profile.total_hikes >= 10,
  },
  {
    key: 'fifty_hikes',
    emoji: '🦅',
    title: 'Summit Seeker',
    description: 'Complete 50 hikes',
    check: (_hike, profile) => profile.total_hikes >= 50,
  },
  {
    key: 'fast_hike',
    emoji: '⚡',
    title: 'Speed Demon',
    description: 'Complete a hike in under 30 minutes',
    check: (hike) => (hike.elapsed_seconds ?? Infinity) < 30 * 60,
  },
  {
    key: 'long_hike',
    emoji: '🌄',
    title: 'Endurance',
    description: 'Complete a hike lasting over 4 hours',
    check: (hike) => (hike.elapsed_seconds ?? 0) > 4 * 60 * 60,
  },
  {
    key: 'ten_km',
    emoji: '📍',
    title: '10K Club',
    description: 'Hike more than 10 km in a single session',
    check: (hike) => (hike.distance_km ?? 0) >= 10,
  },
  {
    key: 'total_100km',
    emoji: '🗺️',
    title: 'Century Hiker',
    description: 'Log 100 km total distance',
    check: (_hike, profile) => profile.total_distance_km >= 100,
  },
];

/**
 * Check all achievement conditions after a completed hike and insert any
 * newly earned ones into the database.
 *
 * @returns Array of titles for achievements just unlocked.
 */
export async function evaluateAchievements(
  userId: string,
  hike: Hike,
  profile: UserProfile,
  alreadyEarned: Set<string>,
): Promise<string[]> {
  const newlyEarned: string[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (alreadyEarned.has(def.key)) continue;
    if (def.check(hike, profile)) {
      try {
        await insertAchievement(userId, def.key);
        newlyEarned.push(def.title);
      } catch {
        // Duplicate key constraint means it was already awarded — skip silently.
      }
    }
  }

  return newlyEarned;
}

/**
 * Convert a number of seconds into a human-readable string: HH:MM:SS or MM:SS.
 */
export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
