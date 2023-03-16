import { IError, IListItem } from '@/interfaces/common';
import { IPerson } from '@/interfaces/projectInterfaces';
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
  getResponsibleZones,
} from '@/services/listServices';
import { getPersons } from '@/services/personServices';
import { setProgrammedYears } from '@/utils/common';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IListState {
  types: Array<IListItem>;
  phases: Array<IListItem>;
  areas: Array<IListItem>;
  constructionPhaseDetails: Array<IListItem>;
  categories: Array<IListItem>;
  riskAssessments: Array<IListItem>;
  projectQualityLevels: Array<IListItem>;
  planningPhases: Array<IListItem>;
  constructionPhases: Array<IListItem>;
  responsibleZones: Array<IListItem>;
  responsiblePersons: Array<IListItem>;
  programmedYears: Array<IListItem>;
  error: IError | null | unknown;
}

const initialState: IListState = {
  types: [],
  phases: [],
  areas: [],
  constructionPhaseDetails: [],
  categories: [],
  riskAssessments: [],
  projectQualityLevels: [],
  planningPhases: [],
  constructionPhases: [],
  responsibleZones: [],
  responsiblePersons: [],
  programmedYears: setProgrammedYears(),
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

export const getResponsibleZonesThunk = createAsyncThunk(
  'responsibleZones/get',
  async (_, thunkAPI) => {
    return await getResponsibleZones()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getResponsiblePersonsThunk = createAsyncThunk('persons/get', async (_, thunkAPI) => {
  return await getPersons()
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
        return { ...state, types: action.payload };
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
        return { ...state, phases: action.payload };
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
        return { ...state, areas: action.payload };
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
        return { ...state, constructionPhaseDetails: action.payload };
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
        return { ...state, categories: action.payload };
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
        return { ...state, riskAssessments: action.payload };
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
        return { ...state, projectQualityLevels: action.payload };
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
        return { ...state, planningPhases: action.payload };
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
        return { ...state, constructionPhases: action.payload };
      },
    );
    builder.addCase(
      getConstructionPhasesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET RESPONSIBLE ZONES
    builder.addCase(
      getResponsibleZonesThunk.fulfilled,
      (state, action: PayloadAction<Array<IListItem>>) => {
        return { ...state, responsibleZones: action.payload };
      },
    );
    builder.addCase(
      getResponsibleZonesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET PERSONS
    builder.addCase(
      getResponsiblePersonsThunk.fulfilled,
      (state, action: PayloadAction<Array<IPerson>>) => {
        const personsAsListItems: Array<IListItem> = [];

        // build persons response into IListItems
        action.payload.forEach(({ firstName, lastName, id }) => {
          personsAsListItems.push({ value: `${firstName} ${lastName}`, id });
        });

        return { ...state, responsiblePersons: personsAsListItems };
      },
    );
    builder.addCase(
      getResponsiblePersonsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export default listsSlice.reducer;
