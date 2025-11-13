import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  hasNewNotice: boolean;
  readNoticeIds: string[];
  markNoticeAsRead: () => void;
  setNewNotice: (value: boolean) => void;
  markNoticeIdAsRead: (noticeId: string) => void;
  isNoticeRead: (noticeId: string) => boolean;
  syncBadgeWithUnread: (unreadCount: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      hasNewNotice: true,
      readNoticeIds: [],
      markNoticeAsRead: () => set({ hasNewNotice: false }),
      setNewNotice: (value) => set({ hasNewNotice: value }),
      markNoticeIdAsRead: (noticeId) =>
        set((state) => ({
          readNoticeIds: state.readNoticeIds.includes(noticeId)
            ? state.readNoticeIds
            : [...state.readNoticeIds, noticeId],
        })),
      isNoticeRead: (noticeId) => get().readNoticeIds.includes(noticeId),
      syncBadgeWithUnread: (unreadCount) =>
        set({ hasNewNotice: unreadCount > 0 }),
    }),
    {
      name: 'notification-storage',
    }
  )
);
