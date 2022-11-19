import { IError } from '@/interfaces/common';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { getProjectCard, getProjectCards } from '@/services/projectCardServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IProjectCardState {
  selectedProjectCard: IProjectCard | null;
  projectCards: Array<IProjectCard> | null;
  error: IError | null | unknown;
}

const initialState: IProjectCardState = {
  selectedProjectCard: null,
  projectCards: null,
  error: null,
};

export const getProjectCardsThunk = createAsyncThunk('projectCard/getAll', async (_, thunkAPI) => {
  return await getProjectCards()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const getProjectCardThunk = createAsyncThunk(
  'projectCard/getOne',
  async (id: string, thunkAPI) => {
    return await getProjectCard(id)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const projectCardSlice = createSlice({
  name: 'projectCard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(
      getProjectCardsThunk.fulfilled,
      (state, action: PayloadAction<Array<IProjectCard>>) => {
        return { ...state, projectCards: action.payload };
      },
    );
    builder.addCase(
      getProjectCardsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET ONE
    builder.addCase(getProjectCardThunk.fulfilled, (state, action: PayloadAction<IProjectCard>) => {
      return { ...state, selectedProjectCard: action.payload };
    });
    builder.addCase(
      getProjectCardThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export default projectCardSlice.reducer;
