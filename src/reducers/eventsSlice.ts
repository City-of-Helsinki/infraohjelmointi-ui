import { RootState } from '@/store';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IFinanceEventData, IMaintenanceModeEventData, IProjectEventData } from '../interfaces/eventInterfaces';

interface IEventsSliceState {
  financeUpdate: IFinanceEventData | null;
  projectUpdate: IProjectEventData | null;
  maintenanceModeUpdate: IMaintenanceModeEventData | null;
}
const initialState: IEventsSliceState = {
  financeUpdate: null,
  projectUpdate: null,
  maintenanceModeUpdate: {
    value: 'false'
  },
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
    setMaintenanceModeUpdate(state, action: PayloadAction<IMaintenanceModeEventData>) {
      return { ...state, maintenanceModeUpdate: action.payload}
    }
  },
});

export const { setFinanceUpdate, setProjectUpdate, setMaintenanceModeUpdate} = eventsSlice.actions;

export const selectFinanceUpdate = (state: RootState) => state.events.financeUpdate;
export const selectProjectUpdate = (state: RootState) => state.events.projectUpdate;
export const selectMaintenanceModeUpdate = (state: RootState) => state.events.maintenanceModeUpdate;

export default eventsSlice.reducer;
