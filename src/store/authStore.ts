import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserStatus } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateStatus: (status: UserStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        const userWithStatus = { ...user, status: 'online' as UserStatus };
        set({ user: userWithStatus, isAuthenticated: true });
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userWithStatus));
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      },
      updateStatus: (status) => {
        set((state) => {
          if (state.user) {
            const updatedUser = { ...state.user, status };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { user: updatedUser };
          }
          return state;
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
