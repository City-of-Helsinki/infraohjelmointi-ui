import { IError, IListItem } from '@/interfaces/common';
import { getProjectPhases, getProjectTypes } from '@/services/listServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IListState {
  projectTypes: Array<IListItem>;
  projectPhases: Array<IListItem>;
}

const initialState: IListState = {
  projectTypes: [],
  projectPhases: [],
};

export const getProjectTypesThunk = createAsyncThunk('projectTypes/getAll', async (_, thunkAPI) => {
  return await getProjectTypes()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const getProjectPhasesThunk = createAsyncThunk(
  'projectPhases/getAll',
  async (_, thunkAPI) => {
    return await getProjectPhases()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET PROJECT TYPES
    builder.addCase(
      getProjectTypesThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, projectTypes: action.payload };
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
        return { ...state, projectPhases: action.payload };
      },
    );
    builder.addCase(
      getProjectPhasesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export default listsSlice.reducer;
