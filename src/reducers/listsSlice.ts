import { IListItem, IProjectPhaseDetailListItem } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';
import { IProjectDistrict } from '@/interfaces/locationInterfaces';
import {
  getConstructionPhases,
  getPlanningPhases,
  getProjectPhases,
  getProjectQualityLevels,
  getProjectTypes,
  getProjectPhaseDetails,
  getConstructionProcurementMethods,
  getProjectCategories,
  getResponsibleZones,
  getPersons,
  getDistricts,
  getBudgetOverrunReasons,
  getProgrammers,
  getTalpaProjectRanges,
  getTalpaAssetClasses,
  getTalpaProjectTypes,
  getTalpaServiceClasses,
  getProjectTypeQualifiers,
  getPriorities,
} from '@/services/listServices';
import { RootState } from '@/store';
import { setProgrammedYears } from '@/utils/common';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ITalpaAssetClass,
  ITalpaProjectRange,
  ITalpaProjectType,
  ITalpaServiceClass,
} from '@/interfaces/talpaInterfaces';
import { IPerson } from '@/interfaces/personsInterfaces';

export interface IListState {
  types: Array<IListItem>;
  typeQualifiers: Array<IListItem>;
  phases: Array<IListItem>;
  projectPhaseDetails: Array<IProjectPhaseDetailListItem>;
  constructionProcurementMethods: Array<IListItem>;
  categories: Array<IListItem>;
  projectQualityLevels: Array<IListItem>;
  planningPhases: Array<IListItem>;
  constructionPhases: Array<IListItem>;
  responsibleZones: Array<IListItem>;
  responsiblePersons: Array<IListItem>;
  responsiblePersonsRaw: Array<IPerson>;
  programmedYears: Array<IListItem>;
  projectDistricts: Array<IListItem>;
  projectDivisions: Array<IListItem>;
  projectSubDivisions: Array<IListItem>;
  budgetOverrunReasons: Array<IListItem>;
  projectClasses: Array<IClass>;
  programmers: Array<IListItem>;
  priorities: Array<IListItem>;
  talpaProjectRanges: Array<ITalpaProjectRange>;
  talpaProjectTypes: Array<ITalpaProjectType>;
  talpaServiceClasses: Array<ITalpaServiceClass>;
  talpaAssetClasses: Array<ITalpaAssetClass>;
  error: unknown;
}

const initialState: IListState = {
  types: [],
  typeQualifiers: [],
  phases: [],
  projectPhaseDetails: [],
  constructionProcurementMethods: [],
  categories: [],
  projectQualityLevels: [],
  planningPhases: [],
  constructionPhases: [],
  responsibleZones: [],
  responsiblePersons: [],
  responsiblePersonsRaw: [],
  projectDistricts: [],
  projectDivisions: [],
  projectSubDivisions: [],
  budgetOverrunReasons: [],
  programmedYears: setProgrammedYears(),
  projectClasses: [],
  programmers: [],
  priorities: [],
  talpaProjectRanges: [],
  talpaProjectTypes: [],
  talpaServiceClasses: [],
  talpaAssetClasses: [],
  error: null,
};

// Sorting the list of responsible persons by value which has the person name with lastname first
export const sortOptions = (persons: Array<IListItem>) =>
  [...persons].sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));

const getResponsiblePersons = async () => {
  try {
    const persons = await getPersons();
    return persons;
  } catch (e) {
    console.log('Error getting responsible persons: ', e);
    return [];
  }
};

export const getProjectDistricts = (districts: IProjectDistrict[], districtLevel: string) => {
  const filtered = districts.filter(({ level }) => level == districtLevel);
  const mapped = filtered.map(({ id, name, parent }) => ({
    value: name,
    id,
    ...(parent && { parent: parent }),
  }));
  return sortOptions(mapped);
};

export const getListsThunk = createAsyncThunk('lists/get', async (_, thunkAPI) => {
  try {
    const districts = await getDistricts();
    const persons = await getResponsiblePersons();
    return {
      types: await getProjectTypes(),
      typeQualifiers: await getProjectTypeQualifiers(),
      phases: await getProjectPhases(),
      projectPhaseDetails: await getProjectPhaseDetails(),
      constructionProcurementMethods: await getConstructionProcurementMethods(),
      categories: await getProjectCategories(),
      projectQualityLevels: await getProjectQualityLevels(),
      planningPhases: await getPlanningPhases(),
      constructionPhases: await getConstructionPhases(),
      responsibleZones: await getResponsibleZones(),
      responsiblePersons: sortOptions(
        persons.map(({ firstName, lastName, id }) => ({
          value: `${lastName} ${firstName}`,
          id,
        })),
      ),
      responsiblePersonsRaw: persons,
      programmedYears: setProgrammedYears(),
      projectDistricts: getProjectDistricts(districts, 'district'),
      projectDivisions: getProjectDistricts(districts, 'division'),
      projectSubDivisions: getProjectDistricts(districts, 'subDivision'),
      budgetOverrunReasons: await getBudgetOverrunReasons(),
      programmers: await getProgrammers(),
      priorities: await getPriorities(),
      talpaProjectRanges: [],
      talpaProjectTypes: [],
      talpaServiceClasses: [],
      talpaAssetClasses: [],
      projectClasses: [],
    };
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const getTalpaListsThunk = createAsyncThunk('lists/getTalpa', async (_, thunkAPI) => {
  try {
    return {
      talpaProjectRanges: await getTalpaProjectRanges(),
      talpaProjectTypes: await getTalpaProjectTypes(),
      talpaServiceClasses: await getTalpaServiceClasses(),
      talpaAssetClasses: await getTalpaAssetClasses(),
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
    builder.addCase(getListsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GET TALPA LISTS
    builder.addCase(
      getTalpaListsThunk.fulfilled,
      (state, action: PayloadAction<Pick<IListState, 'talpaProjectRanges'>>) => {
        return { ...state, ...action.payload };
      },
    );
    builder.addCase(getTalpaListsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectProjectDistricts = (state: RootState) => state.lists.projectDistricts;
export const selectProjectDivisions = (state: RootState) => state.lists.projectDivisions;
export const selectProjectSubDivisions = (state: RootState) => state.lists.projectSubDivisions;
export const selectCategories = (state: RootState) => state.lists.categories;
export const selectProjectPhases = (state: RootState) => state.lists.phases;
export const selectProjectPhaseDetails = (state: RootState) => state.lists.projectPhaseDetails;
export const selectBudgetOverrunReasons = (state: RootState) => state.lists.budgetOverrunReasons;
export const selectProjectClasses = (state: RootState) => state.lists.projectClasses;
export const selectProgrammers = (state: RootState) => state.lists.programmers;
export const selectResponsiblePersonsRaw = (state: RootState) => state.lists.responsiblePersonsRaw;
export const selectTalpaProjectRanges = (state: RootState) => state.lists.talpaProjectRanges;
export const selectTalpaProjectTypes = (state: RootState) => state.lists.talpaProjectTypes;
export const selectTalpaServiceClasses = (state: RootState) => state.lists.talpaServiceClasses;
export const selectTalpaAssetClasses = (state: RootState) => state.lists.talpaAssetClasses;

export default listsSlice.reducer;
