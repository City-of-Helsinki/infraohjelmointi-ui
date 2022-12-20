import { IError, IListItem } from '@/interfaces/common';
import {
  getConstructionPhases,
  getPlanningPhases,
  getProjectAreas,
  getProjectPhases,
  getProjectQualityLevels,
  getProjectTypes,
  getConstructionPhaseDetails,
} from '@/services/listServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IListState {
  type: Array<IListItem>;
  phase: Array<IListItem>;
  area: Array<IListItem>;
  constructionPhaseDetail: Array<IListItem>;
  masterClass: Array<IListItem>;
  class: Array<IListItem>;
  subClass: Array<IListItem>;
  projectQualityLevel: Array<IListItem>;
  planningPhase: Array<IListItem>;
  constructionPhase: Array<IListItem>;
  error: IError | null | unknown;
}

const initialState: IListState = {
  type: [],
  phase: [],
  area: [],
  constructionPhaseDetail: [],
  masterClass: [],
  class: [],
  subClass: [],
  projectQualityLevel: [],
  planningPhase: [],
  constructionPhase: [],
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

export const getConstructionPhaseDetailsThunk = createAsyncThunk(
  'constructionPhaseDetails/get',
  async (_, thunkAPI) => {
    return await getConstructionPhaseDetails()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getProjectQualityLevelsThunk = createAsyncThunk(
  'projectQualityLevels/get',
  async (_, thunkAPI) => {
    return await getProjectQualityLevels()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getPlanningPhasesThunk = createAsyncThunk(
  'planningPhases/get',
  async (_, thunkAPI) => {
    return await getPlanningPhases()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getConstructionPhasesThunk = createAsyncThunk(
  'constructionPhases/get',
  async (_, thunkAPI) => {
    return await getConstructionPhases()
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
    // GET Construction phase details
    builder.addCase(
      getConstructionPhaseDetailsThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, constructionPhaseDetail: action.payload };
      },
    );
    builder.addCase(
      getConstructionPhaseDetailsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET PROJECT QUALITIES
    builder.addCase(
      getProjectQualityLevelsThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, projectQualityLevel: action.payload };
      },
    );
    builder.addCase(
      getProjectQualityLevelsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET PLANNING PHASES
    builder.addCase(
      getPlanningPhasesThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, planningPhase: action.payload };
      },
    );
    builder.addCase(
      getPlanningPhasesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET CONSTRUCTION PHASES
    builder.addCase(
      getConstructionPhasesThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, constructionPhase: action.payload };
      },
    );
    builder.addCase(
      getConstructionPhasesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export default listsSlice.reducer;
