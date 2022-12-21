import { INotification, NotificationColorType } from '@/interfaces/common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface INotificationState extends INotification {
  id: number;
  color: NotificationColorType;
  duration?: number;
}
const initialState: Array<INotificationState> = [];

const setNotification = (
  notification: INotification,
  id: number,
  color: NotificationColorType,
): INotificationState => {
  notification.type = notification.type || 'notification';
  return { id, color, ...notification };
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notifySuccess(state, action: PayloadAction<INotification>) {
      state.push(setNotification(action.payload, state.length, 'success'));
    },
    notifyError(state, action: PayloadAction<INotification>) {
      state.push(setNotification(action.payload, state.length, 'error'));
    },
    notifyInfo(state, action: PayloadAction<INotification>) {
      state.push(setNotification(action.payload, state.length, 'info'));
    },
    clearNotification(state, action: PayloadAction<number>) {
      return state.filter((s) => s.id !== action.payload);
    },
  },
});

export const { notifySuccess, notifyError, notifyInfo, clearNotification } =
  notificationSlice.actions;

export default notificationSlice.reducer;
