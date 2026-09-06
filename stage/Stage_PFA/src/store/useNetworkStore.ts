import { create } from 'zustand';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { useCartStore } from './useCartStore';

export interface NetworkState {
  isConnected: boolean;
  wasOffline: boolean;
  connectionType: string | null;
  lastOnlineAt: number | null;
  lastOfflineAt: number | null;

  /** Call once in root _layout to start listening. Returns unsubscribe. */
  startListening: () => NetInfoSubscription;

  /** Manually refresh connectivity status. */
  refresh: () => Promise<void>;
}

/**
 * Zustand Network Connectivity Store powered by @react-native-community/netinfo.
 *
 * - Tracks isConnected / wasOffline for UI banner display.
 * - On reconnection: auto-triggers cart syncWithServer.
 * - Stores timestamps for last online / offline transitions.
 */
export const useNetworkStore = create<NetworkState>((set, get) => ({
  isConnected: true,
  wasOffline: false,
  connectionType: null,
  lastOnlineAt: Date.now(),
  lastOfflineAt: null,

  startListening: () => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const prevConnected = get().isConnected;
      const nowConnected = state.isConnected ?? false;

      set({
        isConnected: nowConnected,
        connectionType: state.type,
      });

      // Just went offline
      if (prevConnected && !nowConnected) {
        set({
          wasOffline: true,
          lastOfflineAt: Date.now(),
        });
      }

      // Just came back online after being offline
      if (!prevConnected && nowConnected && get().wasOffline) {
        set({ lastOnlineAt: Date.now() });

        // Auto-sync cart with server on reconnection
        setTimeout(async () => {
          try {
            const result = await useCartStore.getState().syncWithServer();
            if (result.synced) {
              useCartStore.getState().showToast(
                `Panier synchronisé (${result.mergedCount} articles)`,
                'success'
              );
            }
          } catch (err) {
            console.warn('Auto cart sync on reconnection failed:', err);
          }
        }, 1500);
      }
    });

    return unsubscribe;
  },

  refresh: async () => {
    const state = await NetInfo.fetch();
    set({
      isConnected: state.isConnected ?? false,
      connectionType: state.type,
    });
  },
}));

export default useNetworkStore;
