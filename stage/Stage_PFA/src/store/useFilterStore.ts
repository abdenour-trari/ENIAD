import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CatalogFilters {
  priceLevel: string | null; // e.g. '$', '$$', '$$$'
  maxDistance: number | null; // distance max in km (e.g. 1, 2, 5)
  minRating: number | null; // minimum rating (e.g. 4.0, 4.5)
  maxDeliveryTime: number | null; // maximum delivery time in minutes (e.g. 20, 30, 45)
}

export const initialFilters: CatalogFilters = {
  priceLevel: null,
  maxDistance: null,
  minRating: null,
  maxDeliveryTime: null,
};

interface FilterState {
  filters: CatalogFilters;
  setPriceLevel: (priceLevel: string | null) => void;
  setMaxDistance: (distance: number | null) => void;
  setMinRating: (rating: number | null) => void;
  setMaxDeliveryTime: (time: number | null) => void;
  resetFilters: () => void;
  getActiveFiltersCount: () => number;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: initialFilters,

      setPriceLevel: (priceLevel) =>
        set((state) => ({ filters: { ...state.filters, priceLevel } })),

      setMaxDistance: (maxDistance) =>
        set((state) => ({ filters: { ...state.filters, maxDistance } })),

      setMinRating: (minRating) =>
        set((state) => ({ filters: { ...state.filters, minRating } })),

      setMaxDeliveryTime: (maxDeliveryTime) =>
        set((state) => ({ filters: { ...state.filters, maxDeliveryTime } })),

      resetFilters: () => set({ filters: initialFilters }),

      getActiveFiltersCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.priceLevel !== null) count++;
        if (filters.maxDistance !== null) count++;
        if (filters.minRating !== null) count++;
        if (filters.maxDeliveryTime !== null) count++;
        return count;
      },
    }),
    {
      name: 'jiblina-catalog-filters',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFilterStore;
