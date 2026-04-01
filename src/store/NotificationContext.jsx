import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome!', message: 'Your wallet is ready to use.', time: new Date(), read: false, type: 'info' },
    { id: 2, title: 'KYC Reminder', message: 'Complete your KYC to unlock all features.', time: new Date(Date.now() - 3600000), read: false, type: 'warning' },
  ]);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [{ id: Date.now(), time: new Date(), read: false, ...notif }, ...prev]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead, markAllRead, clearAll, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
