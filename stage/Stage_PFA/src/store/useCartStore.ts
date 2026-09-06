import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types';
import { dataService } from '@/services/dataService';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ToastMessage {
  message: string;
  type: 'error' | 'success' | 'info';
}

export interface CartState {
  cart: CartItem[];
  isSyncing: boolean;
  lastSyncTime: number | null;
  pulseSignal: number;
  toast: ToastMessage | null;

  addToCart: (product: Product, quantity?: number) => void;
  addToCartOptimistic: (product: Product, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getItemCount: () => number;
  syncWithServer: () => Promise<{ synced: boolean; mergedCount: number }>;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  hideToast: () => void;
}

/**
 * Persistent Zustand store for Shopping Cart.
 * Features:
 * - AsyncStorage persistence with `persist` middleware.
 * - Optimistic Add to Cart (`addToCartOptimistic`) with silent state rollback on server failure.
 * - Pulse signal state for immediate badge micro-animations.
 * - Discrete error/notification Toast state.
 * - Smart server sync with conflict resolution algorithm.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isSyncing: false,
      lastSyncTime: null,
      pulseSignal: 0,
      toast: null,

      addToCart: (product: Product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingIndex > -1) {
            const updated = [...state.cart];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return {
              cart: updated,
              pulseSignal: state.pulseSignal + 1,
            };
          }
          return {
            cart: [...state.cart, { product, quantity }],
            pulseSignal: state.pulseSignal + 1,
          };
        });
      },

      /**
       * Optimistic Add to Cart:
       * 1. Instantly updates local cart & fires micro-animation pulse.
       * 2. Calls server in background.
       * 3. On server failure: performs silent rollback + displays discrete Toast error.
       */
      addToCartOptimistic: async (product: Product, quantity = 1) => {
        // Snapshot previous cart state for rollback
        const previousCart = get().cart;

        // 1. Immediate optimistic UI update
        get().addToCart(product, quantity);

        // 2. Background server confirmation
        try {
          const res = await dataService.addItemToCartServer(product, quantity);

          if (res.success && res.data?.success) {
            return true;
          } else {
            // Server error / rejection -> Silent rollback & discrete toast
            set({
              cart: previousCart,
              toast: {
                message: res.message || `Impossible d'ajouter "${product.name}" au panier.`,
                type: 'error',
              },
            });
            return false;
          }
        } catch (error) {
          // Network failure -> Silent rollback & discrete toast
          set({
            cart: previousCart,
            toast: {
              message: `Échec réseau : "${product.name}" n'a pas pu être ajouté.`,
              type: 'error',
            },
          });
          return false;
        }
      },

      removeFromCart: (productId: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getTotalAmount: () => {
        return get().cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      showToast: (message: string, type: 'error' | 'success' | 'info' = 'error') => {
        set({ toast: { message, type } });
      },

      hideToast: () => set({ toast: null }),

      /**
       * Server Cart Synchronization with Smart Conflict Resolution.
       */
      syncWithServer: async () => {
        set({ isSyncing: true });
        try {
          const localCart = get().cart;
          const res = await dataService.syncCart(localCart);

          if (res.success && res.data) {
            const serverCart = (res.data.serverCart as CartItem[]) || [];

            const mergedMap = new Map<string, CartItem>();

            serverCart.forEach((item) => {
              mergedMap.set(item.product.id, { ...item });
            });

            localCart.forEach((localItem) => {
              const existing = mergedMap.get(localItem.product.id);
              if (existing) {
                mergedMap.set(localItem.product.id, {
                  ...existing,
                  quantity: Math.max(existing.quantity, localItem.quantity),
                });
              } else {
                mergedMap.set(localItem.product.id, { ...localItem });
              }
            });

            const mergedCart = Array.from(mergedMap.values());

            set({
              cart: mergedCart,
              lastSyncTime: Date.now(),
              isSyncing: false,
            });

            return { synced: true, mergedCount: mergedCart.length };
          }
        } catch (error) {
          console.error('Error syncing cart with server:', error);
        } finally {
          set({ isSyncing: false });
        }

        return { synced: false, mergedCount: get().cart.length };
      },
    }),
    {
      name: 'jiblina-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;
