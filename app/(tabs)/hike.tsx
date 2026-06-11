// app/tabs/hike.tsx
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useHikeStore } from '@/store';
import { useLocationTracking } from '@/lib/hooks/useLocationTracking';
import { createHike, markSummit, endHike, fetchUserProfile } from '@/lib/supabase/queries';
import { formatElapsed, evaluateAchievements } from '@/lib/utils/achievements';

export default function HikeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { activeHike, status, elapsedSeconds, setActiveHike, setStatus, startTimer, stopTimer, resetHike } =
    useHikeStore();
  const { requestPermissions, getCurrentPosition, startTracking, stopTracking } = useLocationTracking();

  const [loading, setLoading] = useState(false);
  const [waypoints, setWaypoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  // Keep map centred on current location during active hike
  useEffect(() => {
    if (!activeHike || status === 'idle') return;
    const interval = setInterval(async () => {
      const loc = await getCurrentPosition();
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCurrentCoords(coords);
      setWaypoints((prev) => [...prev, coords]);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeHike, status]);

  async function handleStartHike() {
    try {
      setLoading(true);
      await requestPermissions();
      const loc = await getCurrentPosition();
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      const hike = await createHike(user!.id, coords);
      await startTracking(hike.id);

      setActiveHike(hike);
      setStatus('active');
      startTimer();
      setCurrentCoords(coords);
      setWaypoints([coords]);

      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 800);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkSummit() {
    if (!activeHike) return;
    try {
      setLoading(true);
      const loc = await getCurrentPosition();
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      const updated = await markSummit(activeHike.id, coords);
      setActiveHike(updated);
      setStatus('summited');
      Alert.alert('🏔️ Summit reached!', `Time to summit: ${formatElapsed(elapsedSeconds)}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEndHike() {
    if (!activeHike) return;
    Alert.alert('End hike?', 'Are you sure you want to finish this hike?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End hike',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const loc = await getCurrentPosition();
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            const completed = await endHike(activeHike.id, coords);
            await stopTracking();
            stopTimer();

            // Evaluate achievements
            const profile = await fetchUserProfile(user!.id);
            if (profile) {
              const earned = await evaluateAchievements(
                user!.id, completed, profile, new Set()
              );
              if (earned.length > 0) {
                Alert.alert('🏅 Achievement unlocked!', earned.join(', '));
              }
            }

            Alert.alert(
              '🎉 Hike complete!',
              `Total time: ${formatElapsed(completed.elapsed_seconds ?? 0)}`
            );
            resetHike();
            setWaypoints([]);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  const initialRegion = currentCoords
    ? { ...currentCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 7.8731, longitude: 80.7718, latitudeDelta: 3, longitudeDelta: 3 }; // Sri Lanka default

  async function handleCenterOnLocation() {
    try {
      const loc = await getCurrentPosition();
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
    } catch (e: any) {
      Alert.alert('Location error', e.message);
    }
  }

  return (
    <View style={styles.container}>
      {/* Map — uses default Google Maps tiles on Android (no 403 issues) */}
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation showsMyLocationButton={false}>
        {waypoints.length > 1 && (
          <Polyline coordinates={waypoints} strokeColor="#7ec87e" strokeWidth={3} />
        )}
        {activeHike && (
          <Marker
            coordinate={{ latitude: activeHike.start_latitude, longitude: activeHike.start_longitude }}
            title="Start"
            pinColor="#4CAF50"
          />
        )}
        {activeHike?.summit_latitude && (
          <Marker
            coordinate={{ latitude: activeHike.summit_latitude!, longitude: activeHike.summit_longitude! }}
            title="Summit"
            pinColor="#2196F3"
          />
        )}
      </MapView>

      {/* Timer overlay */}
      {status !== 'idle' && (
        <View style={styles.timerOverlay}>
          <Text style={styles.timerLabel}>
            {status === 'summited' ? '🏔️ Descended' : '⏱ Hiking'}
          </Text>
          <Text style={styles.timerValue}>{formatElapsed(elapsedSeconds)}</Text>
        </View>
      )}

      {/* My location button */}
      <TouchableOpacity style={styles.locationBtn} onPress={handleCenterOnLocation}>
        <Ionicons name="locate" size={22} color="#7ec87e" />
      </TouchableOpacity>

      {/* Action panel */}
      <View style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}>
        {status === 'idle' && (
          <TouchableOpacity style={[styles.btn, styles.btnStart]} onPress={handleStartHike} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.btnText}>Start Hike</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {status === 'active' && (
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.btnSummit]} onPress={handleMarkSummit} disabled={loading}>
              <Ionicons name="flag" size={20} color="#fff" />
              <Text style={styles.btnText}>At summit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnEnd]} onPress={handleEndHike} disabled={loading}>
              <Ionicons name="stop" size={20} color="#fff" />
              <Text style={styles.btnText}>End hike</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'summited' && (
          <TouchableOpacity style={[styles.btn, styles.btnEnd]} onPress={handleEndHike} disabled={loading}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.btnText}>Finish hike</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e1a' },
  map: { flex: 1 },
  timerOverlay: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(26,46,26,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d5a27',
  },
  timerLabel: { color: '#7ec87e', fontSize: 12, marginBottom: 2 },
  timerValue: { color: '#fff', fontSize: 28, fontWeight: '600', fontVariant: ['tabular-nums'] },
  panel: {
    backgroundColor: '#1a2e1a',
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#2d5a27',
  },
  locationBtn: {
    position: 'absolute',
    bottom: 140,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a2e1a',
    borderWidth: 1,
    borderColor: '#2d5a27',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  row: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  btnStart: { backgroundColor: '#2d5a27' },
  btnSummit: { backgroundColor: '#1565C0' },
  btnEnd: { backgroundColor: '#b71c1c' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
