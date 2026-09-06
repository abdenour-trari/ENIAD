import { create } from 'zustand';
import { Product } from '@/types';
import { useCartStore, CartItem } from './useCartStore';

export type { CartItem };

interface AppState {
  cart: CartItem[];
  selectedCategoryId: string | null;
  searchQuery: string;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  getTotalAmount: () => number;
}

export const useAppStore = create<AppState>((set) => ({
  cart: useCartStore.getState().cart,
  selectedCategoryId: null,
  searchQuery: '',

  addToCart: (product: Product, quantity = 1) => {
    useCartStore.getState().addToCart(product, quantity);
  },

  removeFromCart: (productId: string) => {
    useCartStore.getState().removeFromCart(productId);
  },

  updateQuantity: (productId: string, quantity: number) => {
    useCartStore.getState().updateQuantity(productId, quantity);
  },

  clearCart: () => useCartStore.getState().clearCart(),

  setSelectedCategoryId: (categoryId: string | null) =>
    set({ selectedCategoryId: categoryId }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  getTotalAmount: () => {
    return useCartStore.getState().getTotalAmount();
  },
}));

// Synchronize useAppStore.cart with useCartStore for seamless backwards compatibility
useCartStore.subscribe((state) => {
  useAppStore.setState({ cart: state.cart });
});

export default useAppStore;
