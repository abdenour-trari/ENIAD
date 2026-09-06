import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchState {
  history: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      history: [],

      addSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        set((state) => {
          // Remove duplicate if entry already exists (case-insensitive matching)
          const filtered = state.history.filter(
            (item) => item.toLowerCase() !== trimmed.toLowerCase()
          );
          // Prepend new search term and retain max 10 entries
          const updated = [trimmed, ...filtered].slice(0, 10);
          return { history: updated };
        });
      },

      removeSearch: (query: string) => {
        set((state) => ({
          history: state.history.filter(
            (item) => item.toLowerCase() !== query.toLowerCase()
          ),
        }));
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'jiblina-search-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSearchStore;
