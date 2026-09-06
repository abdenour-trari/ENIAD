import { create } from 'zustand';
import { dataService, GroupOrderType } from '@/services/dataService';

export type ParticipantStatus = 'NOT_JOINED' | 'CHOOSING' | 'VALIDATED';

export const PARTICIPANT_STATUS_CONFIG: Record<
  ParticipantStatus,
  { label: string; bgClass: string; textClass: string; icon: string; dotColor: string }
> = {
  NOT_JOINED: {
    label: "n'a pas encore rejoint",
    bgClass: 'bg-slate-100 border-slate-200/80',
    textClass: 'text-slate-600',
    icon: 'mail-outline',
    dotColor: '#94a3b8',
  },
  CHOOSING: {
    label: 'en train de choisir',
    bgClass: 'bg-amber-50 border-amber-200/80',
    textClass: 'text-amber-700',
    icon: 'cart-outline',
    dotColor: '#f59e0b',
  },
  VALIDATED: {
    label: 'a validé sa commande',
    bgClass: 'bg-emerald-50 border-emerald-200/80',
    textClass: 'text-emerald-700',
    icon: 'checkmark-circle-outline',
    dotColor: '#16a34a',
  },
};

interface GroupOrderState {
  activeGroup: GroupOrderType | null;
  memberStatuses: Record<string, ParticipantStatus>;
  isPolling: boolean;
  lastUpdated: number | null;
  pollingTimer: any | null;

  fetchGroupOrder: (groupId: string) => Promise<void>;
  updateMemberStatus: (memberId: string, status: ParticipantStatus) => void;
  startPolling: (groupId: string, intervalMs?: number) => void;
  stopPolling: () => void;
}

/**
 * Zustand store for Group Orders with Real-Time Polling Engine.
 * Manages live participant statuses ("n'a pas encore rejoint", "en train de choisir", "a validé sa commande").
 */
export const useGroupOrderStore = create<GroupOrderState>((set, get) => ({
  activeGroup: null,
  memberStatuses: {},
  isPolling: false,
  lastUpdated: null,
  pollingTimer: null,

  fetchGroupOrder: async (groupId: string) => {
    try {
      const res = await dataService.getGroupOrderById(groupId);
      if (res.data) {
        const group = res.data;

        // Initialize or update statuses if not present
        const currentStatuses = { ...get().memberStatuses };
        group.members.forEach((m, idx) => {
          if (!currentStatuses[m.id]) {
            if (m.isCreator || m.paymentStatus === 'paid') {
              currentStatuses[m.id] = 'VALIDATED';
            } else if (idx % 2 === 0) {
              currentStatuses[m.id] = 'CHOOSING';
            } else {
              currentStatuses[m.id] = 'NOT_JOINED';
            }
          }
        });

        set({
          activeGroup: group,
          memberStatuses: currentStatuses,
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error fetching group order in store:', error);
    }
  },

  updateMemberStatus: (memberId: string, status: ParticipantStatus) => {
    set((state) => ({
      memberStatuses: {
        ...state.memberStatuses,
        [memberId]: status,
      },
      lastUpdated: Date.now(),
    }));
  },

  startPolling: (groupId: string, intervalMs = 4000) => {
    // Clear existing timer if any
    get().stopPolling();

    // Initial fetch
    get().fetchGroupOrder(groupId);

    const timer = setInterval(() => {
      get().fetchGroupOrder(groupId);

      // Simulate live status transitions on polling ticks
      const statuses = { ...get().memberStatuses };
      const keys = Object.keys(statuses);
      if (keys.length > 0) {
        // Randomly transition a member from 'CHOOSING' -> 'VALIDATED' or 'NOT_JOINED' -> 'CHOOSING'
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        if (statuses[randomKey] === 'CHOOSING') {
          statuses[randomKey] = 'VALIDATED';
        } else if (statuses[randomKey] === 'NOT_JOINED') {
          statuses[randomKey] = 'CHOOSING';
        }
        set({ memberStatuses: statuses, lastUpdated: Date.now() });
      }
    }, intervalMs);

    set({ isPolling: true, pollingTimer: timer });
  },

  stopPolling: () => {
    const timer = get().pollingTimer;
    if (timer) {
      clearInterval(timer);
    }
    set({ isPolling: false, pollingTimer: null });
  },
}));

export default useGroupOrderStore;
