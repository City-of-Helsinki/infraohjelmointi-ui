import { IError, IListItem } from '@/interfaces/common';
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
  getPersons,
} from '@/services/listServices';
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

const getResponsiblePersons = async () => {
  try {
    const persons = await getPersons();
    return persons.map(({ firstName, lastName, id }) => ({
      value: `${firstName} ${lastName}`,
      id,
    }));
  } catch (e) {
    console.log('Error getting responsible persons: ', e);
    return [];
  }
};

export const getListsThunk = createAsyncThunk('lists/get', async (_, thunkAPI) => {
  try {
    return {
      types: await getProjectTypes(),
      phases: await getProjectPhases(),
      areas: await getProjectAreas(),
      constructionPhaseDetails: await getConstructionPhaseDetails(),
      categories: await getProjectCategories(),
      riskAssessments: await getProjectRisks(),
      projectQualityLevels: await getProjectQualityLevels(),
      planningPhases: await getPlanningPhases(),
      constructionPhases: await getConstructionPhases(),
      responsibleZones: await getResponsibleZones(),
      responsiblePersons: await getResponsiblePersons(),
      programmedYears: setProgrammedYears(),
    };
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET All LISTS
    builder.addCase(
      getListsThunk.fulfilled,
      (state, action: PayloadAction<Omit<IListState, 'error'>>) => {
        return { ...state, ...action.payload };
      },
    );
    builder.addCase(getListsThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export default listsSlice.reducer;
