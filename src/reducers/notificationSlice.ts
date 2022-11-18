import { INotification } from '@/interfaces/common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface INotificationState extends INotification {
  id: number;
}
const initialState: Array<INotificationState> = [];

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotification(state, action: PayloadAction<INotification>) {
      state.push({ id: state.length, ...action.payload });
    },
    clearNotification(state, action: PayloadAction<number>) {
      return (state = state.filter((s) => s.id !== action.payload));
    },
  },
});

export const { setNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
