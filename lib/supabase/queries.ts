// lib/supabase/queries.ts
import { supabase } from './client';
import type { Hike, UserProfile, Achievement, LeaderboardEntry } from '@/types';

// ── Hike mutations ───────────────────────────────────────────────────────────

export async function createHike(
  userId: string,
  coords: { latitude: number; longitude: number },
): Promise<Hike> {
  const { data, error } = await supabase
    .from('hikes')
    .insert({
      user_id: userId,
      status: 'active',
      start_time: new Date().toISOString(),
      start_latitude: coords.latitude,
      start_longitude: coords.longitude,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Hike;
}

export async function markSummit(
  hikeId: string,
  coords: { latitude: number; longitude: number },
): Promise<Hike> {
  const { data, error } = await supabase
    .from('hikes')
    .update({
      status: 'summited',
      summit_time: new Date().toISOString(),
      summit_latitude: coords.latitude,
      summit_longitude: coords.longitude,
    })
    .eq('id', hikeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Hike;
}

export async function endHike(
  hikeId: string,
  coords: { latitude: number; longitude: number },
): Promise<Hike> {
  // Pull start time to compute elapsed
  const { data: existing, error: fetchErr } = await supabase
    .from('hikes')
    .select('start_time, summit_time')
    .eq('id', hikeId)
    .single();

  if (fetchErr) throw new Error(fetchErr.message);

  const now = new Date();
  const startTime = new Date(existing.start_time);
  const elapsedSeconds = Math.round((now.getTime() - startTime.getTime()) / 1000);
  const summitElapsedSeconds = existing.summit_time
    ? Math.round((new Date(existing.summit_time).getTime() - startTime.getTime()) / 1000)
    : null;

  const { data, error } = await supabase
    .from('hikes')
    .update({
      status: 'completed',
      end_time: now.toISOString(),
      end_latitude: coords.latitude,
      end_longitude: coords.longitude,
      elapsed_seconds: elapsedSeconds,
      summit_elapsed_seconds: summitElapsedSeconds,
    })
    .eq('id', hikeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Hike;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function fetchRecentHikes(userId: string): Promise<Hike[]> {
  const { data, error } = await supabase
    .from('hikes')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []) as Hike[];
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, total_hikes')
    .order('total_hikes', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  const entries: LeaderboardEntry[] = await Promise.all(
    (data ?? []).map(async (u) => {
      const { data: bestHike } = await supabase
        .from('hikes')
        .select('elapsed_seconds')
        .eq('user_id', u.id)
        .eq('status', 'completed')
        .order('elapsed_seconds', { ascending: true })
        .limit(1)
        .maybeSingle();

      return {
        username: u.username,
        total_hikes: u.total_hikes ?? 0,
        best_elapsed_seconds: bestHike?.elapsed_seconds ?? 0,
      };
    }),
  );

  return entries;
}

export async function fetchUserAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return (data ?? []) as Achievement[];
}

export async function insertAchievement(userId: string, key: string): Promise<void> {
  await supabase
    .from('achievements')
    .insert({ user_id: userId, key })
    .throwOnError();
}

export async function insertWaypoints(
  hikeId: string,
  points: { latitude: number; longitude: number; altitude?: number; type?: string }[],
): Promise<void> {
  const rows = points.map((p) => ({
    hike_id: hikeId,
    latitude: p.latitude,
    longitude: p.longitude,
    altitude: p.altitude ?? null,
    type: p.type ?? 'track',
    recorded_at: new Date().toISOString(),
  }));

  await supabase.from('waypoints').insert(rows).throwOnError();
}
