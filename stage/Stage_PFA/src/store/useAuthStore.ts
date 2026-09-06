import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'user_demo',
    name: 'Karim Bennani',
    email: 'karim@jiblina.ma',
    phone: '+212 600 112 233',
    createdAt: '2026-01-15T10:00:00Z',
  },
  isAuthenticated: true,

  login: (user: User) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateProfile: (data: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}));
