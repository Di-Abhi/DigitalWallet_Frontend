import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string; // ISO string (Date is not serializable in Redux)
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [
    {
      id: 1,
      title: 'Welcome!',
      message: 'Your wallet is ready to use.',
      time: new Date().toISOString(),
      read: false,
      type: 'info',
    },
    {
      id: 2,
      title: 'KYC Reminder',
      message: 'Complete your KYC to unlock all features.',
      time: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'warning',
    },
  ],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'time' | 'read'>>
    ) {
      state.notifications.unshift({
        id: Date.now(),
        time: new Date().toISOString(),
        read: false,
        ...action.payload,
      });
    },
    markRead(state, action: PayloadAction<number>) {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllRead(state) {
      state.notifications.forEach((n) => { n.read = true; });
    },
    clearAll(state) {
      state.notifications = [];
    },
  },
});

export const { addNotification, markRead, markAllRead, clearAll } =
  notificationSlice.actions;
export default notificationSlice.reducer;
