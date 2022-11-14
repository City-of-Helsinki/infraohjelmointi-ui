import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IProjectCardState {
  selectedProjectCard: IProjectCard | null;
}

// TODO: initialState should be empty when we get actual data using Thunks
const initialState: IProjectCardState = {
  selectedProjectCard: null,
};

export const projectCardSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    resetProjectCard: (state) => {
      state.selectedProjectCard = initialState.selectedProjectCard;
    },
    // Should be a thunk
    setProjectCard: (state, action: PayloadAction<IProjectCard>) => {
      state.selectedProjectCard = action.payload;
    },
  },
});

export const { resetProjectCard, setProjectCard } = projectCardSlice.actions;

export default projectCardSlice.reducer;
