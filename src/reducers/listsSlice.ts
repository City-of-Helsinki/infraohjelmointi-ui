import { IError, IListItem } from '@/interfaces/common';
import { IProjectDistrict } from '@/interfaces/locationInterfaces';
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
  getDistricts,
} from '@/services/listServices';
import { RootState } from '@/store';
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
  projectDistricts: Array<IListItem>;
  projectSubDistricts: Array<IListItem>;
  projectSubSubDistricts: Array<IListItem>;
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
  projectDistricts: [],
  projectSubDistricts: [],
  projectSubSubDistricts: [],
  programmedYears: setProgrammedYears(),
  error: null,
};

// Sorting the list of responsible persons by value which has the person name with lastname first
export const sortOptions = (persons: Array<IListItem>) =>
  [...persons].sort((a, b) => a.value < b.value ? -1 : (a.value > b.value ? 1 : 0));

const getResponsiblePersons = async () => {
  try {
    const persons = await getPersons();
    return sortOptions(persons.map(({ firstName, lastName, id }) => ({
      value: `${lastName} ${firstName}`,
      id,
    })));
  } catch (e) {
    console.log('Error getting responsible persons: ', e);
    return [];
  }
};

const getProjectDistricts = (districts: IProjectDistrict[], districtLevel: string) => {
    const filtered = districts.filter(({ level }) => level == districtLevel);
    const mapped = filtered.map(({ id, name, parent }) => ({
      value: name,
      id,
      ... (parent && {parent: parent})
    }))
    return sortOptions(mapped);
}

export const getListsThunk = createAsyncThunk('lists/get', async (_, thunkAPI) => {
  try {
    const districts = await getDistricts();
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
      projectDistricts: getProjectDistricts(districts, "district"),
      projectSubDistricts: getProjectDistricts(districts, "subDistrict"),
      projectSubSubDistricts: getProjectDistricts(districts, "subSubDistrict")
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

export const selectProjectDistricts = (state: RootState) => state.lists.projectDistricts;
export const selectProjectSubDistricts = (state: RootState) => state.lists.projectSubDistricts;
export const selectProjectSubSubDistricts = (state: RootState) => state.lists.projectSubSubDistricts;

export default listsSlice.reducer;
