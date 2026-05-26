import { create } from 'zustand';

export interface UserSession {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthState {
  currentUser: UserSession | null;
  setCurrentUser: (user: AuthState['currentUser']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));
