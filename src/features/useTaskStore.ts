import { create } from 'zustand';

export type TaskFilter = 'Todas' | 'Completadas' | 'Pendientes';

interface TaskState {
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  filter: 'Todas',
  setFilter: (filter) => set({ filter }),
}));
