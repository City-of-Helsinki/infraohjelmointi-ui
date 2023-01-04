import { IClass } from '@/interfaces/classInterfaces';
import { IError, IListItem } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import {
  getConstructionPhases,
  getPlanningPhases,
  getProjectAreas,
  getProjectPhases,
  getProjectQualityLevels,
  getProjectTypes,
  getConstructionPhaseDetails,
  getProjectCategories,
  getProjectRisks,
} from '@/services/listServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IListState {
  type: Array<IListItem>;
  phase: Array<IListItem>;
  area: Array<IListItem>;
  constructionPhaseDetail: Array<IListItem>;
  category: Array<IListItem>;
  riskAssessment: Array<IListItem>;
  masterClass: Array<IListItem>;
  class: Array<IListItem>;
  subClass: Array<IListItem>;
  projectQualityLevel: Array<IListItem>;
  planningPhase: Array<IListItem>;
  constructionPhase: Array<IListItem>;
  district: Array<IListItem>;
  division: Array<IListItem>;
  subDivision: Array<IListItem>;
  error: IError | null | unknown;
}

const initialState: IListState = {
  type: [],
  phase: [],
  area: [],
  constructionPhaseDetail: [],
  category: [],
  riskAssessment: [],
  masterClass: [],
  class: [],
  subClass: [],
  projectQualityLevel: [],
  planningPhase: [],
  constructionPhase: [],
  district: [],
  division: [],
  subDivision: [],
  error: null,
};

const classesToListItems = (classes: Array<IClass>): Array<IListItem> =>
  classes.map((mc) => ({
    id: mc.id,
    value: mc.name,
  }));

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

export const getProjectCategoriesThunk = createAsyncThunk(
  'projectCategories/get',
  async (_, thunkAPI) => {
    return await getProjectCategories()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getProjectRisksThunk = createAsyncThunk('projectRisks/get', async (_, thunkAPI) => {
  return await getProjectRisks()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setMasterClassList(state, action: PayloadAction<Array<IClass>>) {
      return { ...state, masterClass: classesToListItems(action.payload) };
    },
    setClassList(state, action: PayloadAction<Array<IClass>>) {
      return { ...state, class: classesToListItems(action.payload) };
    },
    setSubClassList(state, action: PayloadAction<Array<IClass>>) {
      return { ...state, subClass: classesToListItems(action.payload) };
    },
    setDistrictList(state, action: PayloadAction<Array<ILocation>>) {
      return { ...state, district: classesToListItems(action.payload) };
    },
    setDivisionList(state, action: PayloadAction<Array<ILocation>>) {
      return { ...state, division: classesToListItems(action.payload) };
    },
    setSubDivisionList(state, action: PayloadAction<Array<ILocation>>) {
      return { ...state, subDivision: classesToListItems(action.payload) };
    },
  },
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
    // GET CONSTRUCTION PHASE DETAILS
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
    // GET PROJECT CATEGORIES
    builder.addCase(
      getProjectCategoriesThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, category: action.payload };
      },
    );
    builder.addCase(
      getProjectCategoriesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET PROJECT RISKS
    builder.addCase(
      getProjectRisksThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, riskAssessment: action.payload };
      },
    );
    builder.addCase(
      getProjectRisksThunk.rejected,
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

export const {
  setMasterClassList,
  setClassList,
  setSubClassList,
  setDistrictList,
  setDivisionList,
  setSubDivisionList,
} = listsSlice.actions;

export default listsSlice.reducer;
