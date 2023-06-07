import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IPlanningState {
  selectedYear: number | null;
}

const initialState: IPlanningState = {
  selectedYear: null,
};

export const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    setSelectedYear(state, action: PayloadAction<number | null>) {
      return { ...state, selectedYear: action.payload };
    },
  },
});

export const selectSelectedYear = (state: RootState) => state.planning.selectedYear;

export const { setSelectedYear } = planningSlice.actions;
export default planningSlice.reducer;
