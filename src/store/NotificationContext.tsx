/**
 * NotificationContext — thin compatibility shim over Redux Toolkit notificationSlice.
 * All components continue using `useNotifications()` without any changes.
 */
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import {
  addNotification as addNotificationAction,
  markRead as markReadAction,
  markAllRead as markAllReadAction,
  clearAll as clearAllAction,
} from './slices/notificationSlice';
import type { Notification } from './slices/notificationSlice';

export function useNotifications() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
      dispatch(addNotificationAction(notif));
    },
    [dispatch]
  );

  const markRead = useCallback(
    (id: number) => { dispatch(markReadAction(id)); },
    [dispatch]
  );

  const markAllRead = useCallback(() => {
  dispatch(markAllReadAction());
  dispatch(clearAllAction());
}, [dispatch]);

  const clearAll = useCallback(() => { dispatch(clearAllAction()); }, [dispatch]);

  return { notifications, addNotification, markRead, markAllRead, clearAll, unreadCount };
}

// Legacy provider — now a no-op passthrough
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
