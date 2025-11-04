import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  hasNewNotice: boolean;
  markNoticeAsRead: () => void;
  setNewNotice: (value: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      hasNewNotice: true,
      markNoticeAsRead: () => set({ hasNewNotice: false }),
      setNewNotice: (value) => set({ hasNewNotice: value }),
    }),
    {
      name: 'notification-storage',
    }
  )
);
