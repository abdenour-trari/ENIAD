import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/users/login', { email, password });
        const { access_token, role, name, user_id, learner_id } = res.data;
        set({
          token: access_token,
          user: { id: user_id, name, role, learner_id },
          isAuthenticated: true,
        });
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        return res.data;
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      initAuth: () => {
        const token = get().token;
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },
    }),
    { name: 'nesture-auth' }
  )
);

export const useSessionStore = create((set, get) => ({
  activeSession: null,
  gestures: [],
  isRecording: false,

  startSession: (sessionId, learnerId, difficulty) => {
    set({
      activeSession: { id: sessionId, learnerId, difficulty, startTime: Date.now() },
      gestures: [],
      isRecording: true,
    });
  },

  recordGesture: (gesture) => {
    set((state) => ({ gestures: [...state.gestures, gesture] }));
  },

  endSession: async () => {
    const { activeSession, gestures } = get();
    if (!activeSession) {
      console.warn('[Store] endSession called but no activeSession');
      return null;
    }
    const payload = {
      session_id: activeSession.id,
      gestures,
    };
    console.log('[Store] Ending session:', activeSession.id, 'with', gestures.length, 'gestures');
    try {
      const res = await api.post('/sessions/end', payload);
      console.log('[Store] Session ended successfully:', res.data?.session_id);
      set({ activeSession: null, gestures: [], isRecording: false });
      return res.data;
    } catch (err) {
      console.error('[Store] endSession API error:', err?.response?.status, err?.response?.data || err.message);
      // Clear session state even on error to avoid stuck states
      set({ activeSession: null, gestures: [], isRecording: false });
      throw err;
    }
  },

  clearSession: () => {
    set({ activeSession: null, gestures: [], isRecording: false });
  },
}));
