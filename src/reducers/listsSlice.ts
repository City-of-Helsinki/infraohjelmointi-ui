import { IListItem } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';
import { IProjectDistrict, IProjectDistrictOption } from '@/interfaces/locationInterfaces';
import { FRESH_FETCH, isValidProgrammer, listsApi } from '@/api/listsApi';
import { RootState } from '@/store';
import { setProgrammedYears } from '@/utils/common';
import { toSerializableError } from '@/utils/reduxErrorUtils';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPerson } from '@/interfaces/personsInterfaces';
import {
  DeleteRowPayload,
  MoveRowPayload,
  ReorderableListType,
} from '@/interfaces/menuItemsInterfaces';

export interface IListState {
  types: Array<IListItem>;
  typeQualifiers: Array<IListItem>;
  phases: Array<IListItem>;
  projectPhaseDetails: Array<IListItem>;
  constructionProcurementMethods: Array<IListItem>;
  staraProcurementReasons: Array<IListItem>;
  categories: Array<IListItem>;
  projectQualityLevels: Array<IListItem>;
  planningPhases: Array<IListItem>;
  constructionPhases: Array<IListItem>;
  responsibleZones: Array<IListItem>;
  responsiblePersons: Array<IListItem>;
  responsiblePersonsRaw: Array<IPerson>;
  programmedYears: Array<IListItem>;
  projectDistricts: Array<IProjectDistrictOption>;
  projectDivisions: Array<IProjectDistrictOption>;
  projectSubDivisions: Array<IProjectDistrictOption>;
  budgetOverrunReasons: Array<IListItem>;
  financingParties: Array<IListItem>;
  projectClasses: Array<IClass>;
  programmers: Array<IListItem>;
  programmersRaw: Array<IPerson>;
  priorities: Array<IListItem>;
  error: unknown;
}

const initialState: IListState = {
  types: [],
  typeQualifiers: [],
  phases: [],
  projectPhaseDetails: [],
  constructionProcurementMethods: [],
  staraProcurementReasons: [],
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
  financingParties: [],
  programmedYears: setProgrammedYears(),
  projectClasses: [],
  programmers: [],
  programmersRaw: [],
  priorities: [],
  error: null,
};

// Sorting the list of responsible persons by value which has the person name with lastname first.
// Generic so widened options (e.g. IProjectDistrictOption) keep their extra fields.
export const sortOptions = <T extends IListItem>(persons: Array<T>): Array<T> =>
  [...persons].sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));

const toResponsiblePersonsListItems = (persons: Array<IPerson>): Array<IListItem> =>
  sortOptions(
    persons.map(({ firstName, lastName, id }) => ({
      value: `${lastName} ${firstName}`,
      id,
    })),
  );

const toProgrammersListItems = (programmers: Array<IPerson>): Array<IListItem> =>
  programmers.filter(isValidProgrammer).map(({ id, firstName, lastName }) => ({
    id,
    value: `${firstName} ${lastName}`.trim(),
  }));

const syncDerivedPersonLists = (state: IListState, listType: ReorderableListType) => {
  if (listType === 'responsiblePersonsRaw') {
    state.responsiblePersons = toResponsiblePersonsListItems(state.responsiblePersonsRaw);
  }

  if (listType === 'programmersRaw') {
    state.programmers = toProgrammersListItems(state.programmersRaw);
  }
};

export const getProjectDistricts = (
  districts: IProjectDistrict[],
  districtLevel: string,
): IProjectDistrictOption[] => {
  const filtered = districts.filter(({ level }) => level == districtLevel);
  // IO-411: keep computedDefaultProgrammer on the option so the project form
  // can pre-fill Ohjelmoija directly from the district chain.
  const mapped: IProjectDistrictOption[] = filtered.map(
    ({ id, name, parent, computedDefaultProgrammer }) => ({
      value: name,
      id,
      ...(parent && { parent }),
      ...(computedDefaultProgrammer && { computedDefaultProgrammer }),
    }),
  );
  return sortOptions(mapped);
};

export const getListsThunk = createAsyncThunk('lists/get', async (_, thunkAPI) => {
  const failedRequests: Array<{ name: string; error: unknown }> = [];
  let requestCount = 0;
  const { dispatch } = thunkAPI;
  const { endpoints } = listsApi;

  // Run a request and fall back to an empty list on failure so one failing list doesn't block the rest.
  const safely = async <T>(name: string, request: () => Promise<T[]>): Promise<T[]> => {
    requestCount++;
    try {
      return await request();
    } catch (error) {
      // The axios interceptor cancels requests e.g. when the user is not loaded yet.
      const isCanceled = (error as { data?: unknown } | undefined)?.data === 'Request canceled';
      if (!isCanceled) {
        console.error(`Error getting ${name}: `, error);
      }
      failedRequests.push({ name, error });
      return [];
    }
  };

  try {
    const requests = {
      districts: safely('districts', () =>
        dispatch(endpoints.getDistricts.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      persons: safely('responsible persons', () =>
        dispatch(endpoints.getPersons.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      types: safely('project types', () =>
        dispatch(endpoints.getProjectTypes.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      typeQualifiers: safely('project type qualifiers', () =>
        dispatch(endpoints.getProjectTypeQualifiers.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      phases: safely('project phases', () =>
        dispatch(endpoints.getProjectPhases.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      projectPhaseDetails: safely('project phase details', () =>
        dispatch(endpoints.getProjectPhaseDetails.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      constructionProcurementMethods: safely('construction procurement methods', () =>
        dispatch(
          endpoints.getConstructionProcurementMethods.initiate(undefined, FRESH_FETCH),
        ).unwrap(),
      ),
      staraProcurementReasons: safely('stara procurement reasons', () =>
        dispatch(endpoints.getStaraProcurementReasons.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      categories: safely('project categories', () =>
        dispatch(endpoints.getProjectCategories.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      projectQualityLevels: safely('project quality levels', () =>
        dispatch(endpoints.getProjectQualityLevels.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      planningPhases: safely('planning phases', () =>
        dispatch(endpoints.getPlanningPhases.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      constructionPhases: safely('construction phases', () =>
        dispatch(endpoints.getConstructionPhases.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      responsibleZones: safely('responsible zones', () =>
        dispatch(endpoints.getResponsibleZones.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      budgetOverrunReasons: safely('budget overrun reasons', () =>
        dispatch(endpoints.getBudgetOverrunReasons.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      financingParties: safely('financing parties', () =>
        dispatch(endpoints.getFinancingParties.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      programmersRaw: safely('programmers', () =>
        dispatch(endpoints.getProgrammers.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
      priorities: safely('priorities', () =>
        dispatch(endpoints.getPriorities.initiate(undefined, FRESH_FETCH)).unwrap(),
      ),
    };

    const districts = await requests.districts;
    const persons = await requests.persons;
    const programmersRaw = await requests.programmersRaw;

    const lists = {
      types: await requests.types,
      typeQualifiers: await requests.typeQualifiers,
      phases: await requests.phases,
      projectPhaseDetails: await requests.projectPhaseDetails,
      constructionProcurementMethods: await requests.constructionProcurementMethods,
      staraProcurementReasons: await requests.staraProcurementReasons,
      categories: await requests.categories,
      projectQualityLevels: await requests.projectQualityLevels,
      planningPhases: await requests.planningPhases,
      constructionPhases: await requests.constructionPhases,
      responsibleZones: await requests.responsibleZones,
      responsiblePersons: toResponsiblePersonsListItems(persons),
      responsiblePersonsRaw: persons,
      programmedYears: setProgrammedYears(),
      projectDistricts: getProjectDistricts(districts, 'district'),
      projectDivisions: getProjectDistricts(districts, 'division'),
      projectSubDivisions: getProjectDistricts(districts, 'subDivision'),
      budgetOverrunReasons: await requests.budgetOverrunReasons,
      financingParties: await requests.financingParties,
      programmers: toProgrammersListItems(programmersRaw),
      programmersRaw,
      priorities: await requests.priorities,
      projectClasses: [],
    };

    if (failedRequests.length === requestCount) {
      return thunkAPI.rejectWithValue(toSerializableError(failedRequests[0].error));
    }

    return lists;
  } catch (err) {
    return thunkAPI.rejectWithValue(toSerializableError(err));
  }
});

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    moveRow: (state, action: PayloadAction<MoveRowPayload>) => {
      const { listType, rowId, direction } = action.payload;
      const list = state[listType];

      const index = list.findIndex((row) => row.id === rowId);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return;

      [list[index], list[newIndex]] = [list[newIndex], list[index]];

      list.forEach((row, idx) => {
        row.order = idx;
      });
    },
    revertRowOrder: (
      state,
      action: PayloadAction<{ listType: ReorderableListType; rows: IListItem[] | IPerson[] }>,
    ) => {
      const { listType, rows } = action.payload;
      Object.assign(state, { [listType]: rows });
    },
    deleteRow: (state, action: PayloadAction<DeleteRowPayload>) => {
      const { listType, rowId } = action.payload;
      const list = state[listType];

      const index = list.findIndex((row: { id: string }) => row.id === rowId);
      if (index === -1) return;

      list.splice(index, 1);
    },
  },
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
    builder.addMatcher(listsApi.endpoints.postMenuListItem.matchFulfilled, (state, action) => {
      const { listType } = action.meta.arg.originalArgs;
      const list = state[listType] as Array<IListItem | IPerson>;
      if (!list) return;

      list.push({
        ...action.payload,
        order: list.length,
      });

      syncDerivedPersonLists(state, listType);
    });
    builder.addMatcher(listsApi.endpoints.patchMenuListItem.matchFulfilled, (state, action) => {
      const { listType } = action.meta.arg.originalArgs;
      const updatedItem = action.payload;
      const list = state[listType] as Array<IListItem | IPerson>;

      const index = list.findIndex((item) => item.id === updatedItem.id);

      if (index !== -1) {
        list[index] = updatedItem;
        syncDerivedPersonLists(state, listType);
      }
    });
    builder.addMatcher(listsApi.endpoints.deleteMenuListItem.matchFulfilled, (state, action) => {
      const { listType, id } = action.meta.arg.originalArgs;

      const list = state[listType];
      const index = list.findIndex((row: { id: string }) => row.id === id);

      if (index !== -1) {
        list.splice(index, 1);
        syncDerivedPersonLists(state, listType);
      }
    });
  },
});

export const selectProjectDistricts = (state: RootState) => state.lists.projectDistricts;
export const selectProjectDivisions = (state: RootState) => state.lists.projectDivisions;
export const selectProjectSubDivisions = (state: RootState) => state.lists.projectSubDivisions;
export const selectCategories = (state: RootState) => state.lists.categories;
export const selectProjectPhases = (state: RootState) => state.lists.phases;
export const selectBudgetOverrunReasons = (state: RootState) => state.lists.budgetOverrunReasons;
export const selectProjectClasses = (state: RootState) => state.lists.projectClasses;
export const selectProgrammers = (state: RootState) => state.lists.programmers;
export const selectResponsiblePersonsRaw = (state: RootState) => state.lists.responsiblePersonsRaw;
export const selectLists = (state: RootState) => state.lists;

export const { deleteRow, moveRow, revertRowOrder } = listsSlice.actions;

export default listsSlice.reducer;
