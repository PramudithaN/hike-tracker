// types/index.ts

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  total_hikes: number;
  total_distance_km: number;
  created_at: string;
}

export interface Hike {
  id: string;
  user_id: string;
  status: 'active' | 'summited' | 'completed';

  start_time: string;
  summit_time: string | null;
  end_time: string | null;

  elapsed_seconds: number | null;
  summit_elapsed_seconds: number | null;

  start_latitude: number;
  start_longitude: number;
  summit_latitude: number | null;
  summit_longitude: number | null;
  end_latitude: number | null;
  end_longitude: number | null;

  distance_km: number | null;
  elevation_gain_m: number | null;

  created_at: string;
}

export interface Waypoint {
  id: string;
  hike_id: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  type: 'track' | 'start' | 'summit' | 'end';
  recorded_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  key: string;
  earned_at: string;
}

export interface LeaderboardEntry {
  username: string;
  total_hikes: number;
  best_elapsed_seconds: number;
}
