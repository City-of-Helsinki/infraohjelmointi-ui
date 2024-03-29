import { RootState } from '@/store';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IFinanceEventData, IProjectEventData } from '../interfaces/eventInterfaces';

interface IEventsSliceState {
  financeUpdate: IFinanceEventData | null;
  projectUpdate: IProjectEventData | null;
}
const initialState: IEventsSliceState = {
  financeUpdate: null,
  projectUpdate: null,
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFinanceUpdate(state, action: PayloadAction<IFinanceEventData>) {
      return { ...state, financeUpdate: action.payload };
    },
    setProjectUpdate(state, action: PayloadAction<IProjectEventData>) {
      return { ...state, projectUpdate: action.payload };
    },
  },
});

export const { setFinanceUpdate, setProjectUpdate } = eventsSlice.actions;

export const selectFinanceUpdate = (state: RootState) => state.events.financeUpdate;
export const selectProjectUpdate = (state: RootState) => state.events.projectUpdate;

export default eventsSlice.reducer;
