import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, getToken } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  language: string;
  plan?: string;
  dailyTokensUsed: number;
  dailyTokensLimit: number;
  createdAt: string;
  updatedAt?: string;
}

interface UserStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: { displayName?: string; language?: string; avatarUrl?: string }) => Promise<boolean>;
  clearMessages: () => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,
      successMessage: null,

      fetchProfile: async () => {
        const token = getToken();
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.get('/users/me');
          set({ profile: data, isLoading: false });
        } catch (err: any) {
          console.error('Failed to fetch profile:', err);
          set({ isLoading: false, error: 'Failed to load profile' });
        }
      },

      updateProfile: async (data) => {
        const token = getToken();
        if (!token) return false;

        set({ isLoading: true, error: null, successMessage: null });
        try {
          const updated = await apiClient.patch('/users/me', data);
          set({
            profile: updated,
            isLoading: false,
            successMessage: 'Profile updated successfully',
          });
          // Auto-clear success after 3s
          setTimeout(() => {
            if (get().successMessage === 'Profile updated successfully') {
              set({ successMessage: null });
            }
          }, 3000);
          return true;
        } catch (err: any) {
          console.error('Failed to update profile:', err);
          set({ isLoading: false, error: 'Failed to update profile' });
          return false;
        }
      },

      clearMessages: () => set({ error: null, successMessage: null }),
      reset: () => set({ profile: null, isLoading: false, error: null, successMessage: null }),
    }),
    {
      name: 'user-profile-storage',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
