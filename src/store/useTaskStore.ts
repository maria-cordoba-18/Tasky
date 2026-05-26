import { create } from 'zustand';
import { syncTasks as syncTasksFn } from '../core/database/sync';

interface TaskStore {
  filter: 'all' | 'completed' | 'pending';
  setFilter: (filter: 'all' | 'completed' | 'pending') => void;
  syncTasks: () => Promise<void>;
  isSyncing: boolean;
}

export const useTaskStore = create<TaskStore>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
  isSyncing: false,
  syncTasks: async () => {
    set({ isSyncing: true });
    try {
      await syncTasksFn();
    } finally {
      set({ isSyncing: false });
    }
  },
}));
