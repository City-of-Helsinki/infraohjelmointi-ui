import { IListItem } from '@/interfaces/common';
import { IClass } from '@/interfaces/classInterfaces';
import { IProjectDistrict, IProjectDistrictOption } from '@/interfaces/locationInterfaces';
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
  getFinancingParties,
  getProgrammers,
  getTalpaProjectRanges,
  getTalpaAssetClasses,
  getTalpaProjectTypes,
  getTalpaServiceClasses,
  getProjectTypeQualifiers,
  getPriorities,
  getStaraProcurementReasons,
  patchMenuListItem,
  postMenuListItem,
  putMenuListOrder,
  getRawProgrammers,
  deleteMenuListItem,
} from '@/services/listServices';
import { RootState } from '@/store';
import { setProgrammedYears } from '@/utils/common';
import { toSerializableError } from '@/utils/reduxErrorUtils';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ITalpaAssetClass,
  ITalpaProjectRange,
  ITalpaProjectType,
  ITalpaServiceClass,
} from '@/interfaces/talpaInterfaces';
import { IPerson } from '@/interfaces/personsInterfaces';
import {
  DeleteRowPayload,
  MenuItemDeleteThunkContent,
  MenuItemPatchThunkContent,
  MenuItemPostThunkContent,
  MoveRowPayload,
  PersonTypeMenuItemPatchThunkContent,
  PersonTypeMenuItemPostThunkContent,
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
  talpaProjectRanges: [],
  talpaProjectTypes: [],
  talpaServiceClasses: [],
  talpaAssetClasses: [],
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
  programmers
    .filter(
      ({ firstName, lastName }) =>
        firstName?.trim() && lastName?.trim() && !(firstName === 'Ei' && lastName === 'Valintaa'),
    )
    .map(({ id, firstName, lastName }) => ({
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

  // Run a request and fall back to an empty list on failure so one failing list doesn't block the rest.
  const safely = async <T extends unknown[]>(
    name: string,
    request: () => Promise<T>,
  ): Promise<T> => {
    requestCount++;
    try {
      return await request();
    } catch (error) {
      // The axios interceptor rejects canceled requests (e.g. user not loaded yet) with undefined.
      if (error !== undefined) {
        console.error(`Error getting ${name}: `, error);
      }
      failedRequests.push({ name, error });
      return [] as unknown as T;
    }
  };

  try {
    const requests = {
      districts: safely('districts', getDistricts),
      persons: safely('responsible persons', getPersons),
      types: safely('project types', getProjectTypes),
      typeQualifiers: safely('project type qualifiers', getProjectTypeQualifiers),
      phases: safely('project phases', getProjectPhases),
      projectPhaseDetails: safely('project phase details', getProjectPhaseDetails),
      constructionProcurementMethods: safely(
        'construction procurement methods',
        getConstructionProcurementMethods,
      ),
      staraProcurementReasons: safely('stara procurement reasons', getStaraProcurementReasons),
      categories: safely('project categories', getProjectCategories),
      projectQualityLevels: safely('project quality levels', getProjectQualityLevels),
      planningPhases: safely('planning phases', getPlanningPhases),
      constructionPhases: safely('construction phases', getConstructionPhases),
      responsibleZones: safely('responsible zones', getResponsibleZones),
      budgetOverrunReasons: safely('budget overrun reasons', getBudgetOverrunReasons),
      financingParties: safely('financing parties', getFinancingParties),
      programmers: safely('programmers', getProgrammers),
      programmersRaw: safely('raw programmers', getRawProgrammers),
      priorities: safely('priorities', getPriorities),
    };

    const districts = await requests.districts;
    const persons = await requests.persons;

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
      programmers: await requests.programmers,
      programmersRaw: await requests.programmersRaw,
      priorities: await requests.priorities,
      talpaProjectRanges: [],
      talpaProjectTypes: [],
      talpaServiceClasses: [],
      talpaAssetClasses: [],
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

export const getTalpaListsThunk = createAsyncThunk('lists/getTalpa', async (_, thunkAPI) => {
  try {
    return {
      talpaProjectRanges: await getTalpaProjectRanges(),
      talpaProjectTypes: await getTalpaProjectTypes(),
      talpaServiceClasses: await getTalpaServiceClasses(),
      talpaAssetClasses: await getTalpaAssetClasses(),
    };
  } catch (err) {
    return thunkAPI.rejectWithValue(toSerializableError(err));
  }
});

export const patchMenuItemsThunk = createAsyncThunk(
  'listItem/patch',
  async (
    thunkContent: MenuItemPatchThunkContent | PersonTypeMenuItemPatchThunkContent,
    thunkAPI,
  ) => {
    try {
      const listItem = await patchMenuListItem(
        thunkContent.request,
        thunkContent.path,
        thunkContent.id,
      );
      return listItem;
    } catch (e) {
      return thunkAPI.rejectWithValue(toSerializableError(e));
    }
  },
);

export const postMenuItemsThunk = createAsyncThunk(
  'listItem/post',
  async (thunkContent: MenuItemPostThunkContent | PersonTypeMenuItemPostThunkContent, thunkAPI) => {
    try {
      const listItem = await postMenuListItem(thunkContent.request, thunkContent.path);
      return listItem;
    } catch (e) {
      return thunkAPI.rejectWithValue(toSerializableError(e));
    }
  },
);

export const deleteMenuItemsThunk = createAsyncThunk(
  'listItem/delete',
  async (thunkContent: MenuItemDeleteThunkContent, thunkAPI) => {
    try {
      await deleteMenuListItem(thunkContent.path, thunkContent.id);
      return {
        listType: thunkContent.listType,
        rowId: thunkContent.id,
      };
    } catch (e) {
      return thunkAPI.rejectWithValue(toSerializableError(e));
    }
  },
);

export const saveTableOrderThunk = createAsyncThunk(
  'listItem/saveOrder',
  async (
    {
      listType,
      path,
    }: {
      listType: keyof Omit<IListState, 'error'>;
      path: string;
    },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const listData = state.lists[listType] as IListItem[];

      const savedTable = await putMenuListOrder(listData, path);
      return savedTable;
    } catch (e) {
      return thunkAPI.rejectWithValue(toSerializableError(e));
    }
  },
);

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
    builder.addCase(postMenuItemsThunk.fulfilled, (state, action) => {
      const { listType } = action.meta.arg;
      const newItem = action.payload;

      const list = state[listType];
      if (!list) return;

      list.push({
        ...newItem,
        order: list.length,
      });

      syncDerivedPersonLists(state, listType);
    });
    builder.addCase(patchMenuItemsThunk.fulfilled, (state, action) => {
      const { listType } = action.meta.arg;
      const updatedItem = action.payload;

      const index = state[listType].findIndex((item) => item.id === updatedItem.id);

      if (index !== -1) {
        state[listType][index] = updatedItem;
        syncDerivedPersonLists(state, listType);
      }
    });
    builder.addCase(deleteMenuItemsThunk.fulfilled, (state, action) => {
      const { listType, rowId } = action.payload;

      const list = state[listType];
      const index = list.findIndex((row: { id: string }) => row.id === rowId);

      if (index !== -1) {
        list.splice(index, 1);
        syncDerivedPersonLists(state, listType);
      }
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
export const selectBudgetOverrunReasons = (state: RootState) => state.lists.budgetOverrunReasons;
export const selectProjectClasses = (state: RootState) => state.lists.projectClasses;
export const selectProgrammers = (state: RootState) => state.lists.programmers;
export const selectResponsiblePersonsRaw = (state: RootState) => state.lists.responsiblePersonsRaw;
export const selectTalpaProjectRanges = (state: RootState) => state.lists.talpaProjectRanges;
export const selectTalpaProjectTypes = (state: RootState) => state.lists.talpaProjectTypes;
export const selectTalpaServiceClasses = (state: RootState) => state.lists.talpaServiceClasses;
export const selectTalpaAssetClasses = (state: RootState) => state.lists.talpaAssetClasses;
export const selectLists = (state: RootState) => state.lists;

export const { deleteRow, moveRow, revertRowOrder } = listsSlice.actions;

export default listsSlice.reducer;
