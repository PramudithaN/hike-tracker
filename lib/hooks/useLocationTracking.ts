// lib/hooks/useLocationTracking.ts
import { useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { insertWaypoints } from '@/lib/supabase/queries';

const BACKGROUND_TASK = 'BACKGROUND_LOCATION_TASK';

// Register the background task once at module load.
// It fires whenever the OS delivers a new location update.
TaskManager.defineTask(BACKGROUND_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('[BG Location]', error.message);
    return;
  }
  const locations: Location.LocationObject[] = data?.locations ?? [];
  if (locations.length === 0) return;

  // Retrieve the active hike id stored in shared state/storage
  const hikeId = (globalThis as any).__activeHikeId as string | undefined;
  if (!hikeId) return;

  await insertWaypoints(
    hikeId,
    locations.map((l) => ({
      latitude: l.coords.latitude,
      longitude: l.coords.longitude,
      altitude: l.coords.altitude ?? undefined,
      type: 'track',
    })),
  );
});

async function requestPermissions() {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') throw new Error('Foreground location permission denied.');

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== 'granted') throw new Error('Background location permission denied. Please allow "Always" in Settings.');
}

async function getCurrentPosition(): Promise<Location.LocationObject> {
  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });
}

export function useLocationTracking() {
  const trackingRef = useRef(false);

  async function startTracking(hikeId: string) {
    if (trackingRef.current) return;
    (globalThis as any).__activeHikeId = hikeId;

    const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK).catch(() => false);
    if (!isRegistered) {
      await Location.startLocationUpdatesAsync(BACKGROUND_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 15_000,       // every 15 s
        distanceInterval: 10,       // or every 10 m
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'TrailMark',
          notificationBody: 'Recording your hike route…',
        },
        pausesUpdatesAutomatically: false,
      });
    }
    trackingRef.current = true;
  }

  async function stopTracking() {
    if (!trackingRef.current) return;
    const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK).catch(() => false);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_TASK);
    }
    (globalThis as any).__activeHikeId = undefined;
    trackingRef.current = false;
  }

  return { requestPermissions, getCurrentPosition, startTracking, stopTracking };
}
