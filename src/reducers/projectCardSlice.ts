import { IError } from '@/interfaces/common';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { getProjectCards } from '@/services/projectCardServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IProjectCardState {
  selectedProjectCard: IProjectCard | null;
  error: IError | null | unknown;
}

const initialState: IProjectCardState = {
  selectedProjectCard: null,
  error: null,
};

export const getProjectCardsThunk = createAsyncThunk('projectCard/getAll', async (_, thunkAPI) => {
  return await getProjectCards()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const projectCardSlice = createSlice({
  name: 'projectCard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getProjectCardsThunk.fulfilled,
      (state, action: PayloadAction<Array<IProjectCard>>) => {
        state.selectedProjectCard = action.payload[0];
      },
    );
    builder.addCase(
      getProjectCardsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        state.selectedProjectCard = initialState.selectedProjectCard;
        state.error = action.payload;
      },
    );
  },
});

export default projectCardSlice.reducer;
