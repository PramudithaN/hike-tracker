// store/index.ts  — Zustand stores for auth and active hike
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Hike } from '@/types';

// ── Auth store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
  listenToAuthChanges: () => () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  listenToAuthChanges: () => {
    // Seed initial session
    supabase.auth.getSession().then(({ data }) => {
      set({ user: data.session?.user ?? null, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });

    return () => subscription.unsubscribe();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

// ── Hike store ───────────────────────────────────────────────────────────────

type HikeStatus = 'idle' | 'active' | 'summited';

interface HikeState {
  activeHike: Hike | null;
  status: HikeStatus;
  elapsedSeconds: number;
  _intervalId: ReturnType<typeof setInterval> | null;
  setActiveHike: (hike: Hike) => void;
  setStatus: (status: HikeStatus) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetHike: () => void;
}

export const useHikeStore = create<HikeState>((set, get) => ({
  activeHike: null,
  status: 'idle',
  elapsedSeconds: 0,
  _intervalId: null,

  setActiveHike: (hike) => set({ activeHike: hike }),
  setStatus: (status) => set({ status }),

  startTimer: () => {
    const existing = get()._intervalId;
    if (existing) clearInterval(existing);
    const id = setInterval(() => {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
    }, 1000);
    set({ _intervalId: id });
  },

  stopTimer: () => {
    const id = get()._intervalId;
    if (id) clearInterval(id);
    set({ _intervalId: null });
  },

  resetHike: () => {
    const id = get()._intervalId;
    if (id) clearInterval(id);
    set({ activeHike: null, status: 'idle', elapsedSeconds: 0, _intervalId: null });
  },
}));
