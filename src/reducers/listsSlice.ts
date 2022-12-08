import { IError, IListItem } from '@/interfaces/common';
import { getProjectAreas, getProjectPhases, getProjectTypes } from '@/services/listServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IListState {
  type: Array<IListItem>;
  phase: Array<IListItem>;
  area: Array<IListItem>;
  error: IError | null | unknown;
}

const initialState: IListState = {
  type: [],
  phase: [],
  area: [],
  error: null,
};

export const getProjectTypesThunk = createAsyncThunk('projectTypes/get', async (_, thunkAPI) => {
  return await getProjectTypes()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const getProjectPhasesThunk = createAsyncThunk('projectPhases/get', async (_, thunkAPI) => {
  return await getProjectPhases()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const getProjectAreasThunk = createAsyncThunk('projectAreas/get', async (_, thunkAPI) => {
  return await getProjectAreas()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET PROJECT TYPES
    builder.addCase(
      getProjectTypesThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, type: action.payload };
      },
    );
    builder.addCase(
      getProjectTypesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET PROJECT PHASES
    builder.addCase(
      getProjectPhasesThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, phase: action.payload };
      },
    );
    builder.addCase(
      getProjectPhasesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET PROJECT AREAS
    builder.addCase(
      getProjectAreasThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, area: action.payload };
      },
    );
    builder.addCase(
      getProjectAreasThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export default listsSlice.reducer;
