import { IClass } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import { getCoordinationClasses, getPlanningClasses } from '@/services/classService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IClassHierarchy {
  allClasses: Array<IClass>;
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  year: number;
}

export interface ICoordinatorClassHierarchy extends IClassHierarchy {
  collectiveSubLevels: Array<IClass>;
  otherClassifications: Array<IClass>;
  otherClassificationSubLevels: Array<IClass>;
}

interface IClassState {
  planning: IClassHierarchy;
  coordination: ICoordinatorClassHierarchy;
  error: unknown;
}

interface IClassUpdatePayload {
  data: IClass | null;
  type: 'coordination' | 'planning';
}

const initialClasses = {
  allClasses: [],
  masterClasses: [],
  classes: [],
  subClasses: [],
  year: new Date().getFullYear(),
};

const initialCoordinationClasses = {
  ...initialClasses,
  collectiveSubLevels: [],
  otherClassifications: [],
  otherClassificationSubLevels: [],
};

const initialState: IClassState = {
  planning: initialClasses,
  coordination: initialCoordinationClasses,
  error: null,
};

export const getPlanningClassesThunk = createAsyncThunk(
  'class/getAllPlanning',
  async (_, thunkAPI) => {
    return await getPlanningClasses()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getCoordinationClassesThunk = createAsyncThunk(
  'class/getAllCoordination',
  async (_, thunkAPI) => {
    return await getCoordinationClasses()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

/**
 * Sorts a list of classes by their numerical value or alphabetically
 */
export const sortClassByName = (classes: Array<IClass>) =>
  [...classes].sort((a, b) => a.name.localeCompare(b.name, 'fi', { sensitivity: 'base' }));

const getClassesForParents = (allClasses: Array<IClass>, parents: Array<IClass>) =>
  parent ? allClasses?.filter((ac) => parents.findIndex((p) => p.id === ac.parent) !== -1) : [];

const separateClassesIntoHierarchy = (allClasses: Array<IClass>, forCoordinator: boolean) => {
  const getClasses = (parents: Array<IClass>) => getClassesForParents(allClasses, parents);

  const masterClasses = allClasses?.filter((ac) => !ac.parent);
  const sortedMasterClasses = sortClassByName([...masterClasses]);
  const classes = getClasses(masterClasses);
  const sortedClasses = sortClassByName([...classes]);
  const subClasses = getClasses(classes);
  const sortedSubClasses = sortClassByName([...subClasses]);

  if (!forCoordinator) {
    return {
      allClasses,
      masterClasses: sortedMasterClasses,
      classes: sortedClasses,
      subClasses: sortedSubClasses,
      year: classes[0]?.finances?.year,
    };
  }

  console.log('sorted masterclasses: ', sortedMasterClasses);

  const collectiveSubLevels = getClasses(subClasses);
  const sortedCollectiveSubLevels = sortClassByName([...collectiveSubLevels]);
  const otherClassifications = getClasses(collectiveSubLevels);
  const sortedOtherClassifications = sortClassByName([...otherClassifications]);
  const otherClassificationSubLevels = getClasses(otherClassifications);
  const sortedOtherClassificationSubLevels = sortClassByName([...otherClassificationSubLevels]);

  return {
    allClasses,
    masterClasses: sortedMasterClasses,
    classes: sortedClasses,
    subClasses: sortedSubClasses,
    collectiveSubLevels: sortedCollectiveSubLevels,
    otherClassifications: sortedOtherClassifications,
    otherClassificationSubLevels: sortedOtherClassificationSubLevels,
    year: classes[0]?.finances?.year,
  };
};

export const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    updateMasterClass(state, action: PayloadAction<IClassUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const masterClasses = [...state[type].masterClasses].map((mc) =>
          mc.id === data.id ? data : mc,
        );
        const sortedMasterClasses = sortClassByName([...masterClasses]);
        return { ...state, [type]: { ...state[type], masterClasses: sortedMasterClasses } };
      }
    },
    updateClass(state, action: PayloadAction<IClassUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const classes = [...state[type].classes].map((c) => (c.id === data.id ? data : c));
        const sortedClasses = sortClassByName([...classes]);
        return { ...state, [type]: { ...state[type], classes: sortedClasses } };
      }
    },
    updateSubClass(state, action: PayloadAction<IClassUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const subClasses = [...state[type].subClasses].map((sc) => (sc.id === data.id ? data : sc));
        const sortedSubClasses = sortClassByName([...subClasses]);
        return { ...state, [type]: { ...state[type], subClasses: sortedSubClasses } };
      }
    },
    updateCollectiveSubLevel(state, action: PayloadAction<IClass | null>) {
      const data = action.payload;

      if (data) {
        const collectiveSubLevels = [...state.coordination.collectiveSubLevels].map((sc) =>
          sc.id === data.id ? data : sc,
        );
        const sortedCollectiveSubLevels = sortClassByName([...collectiveSubLevels]);
        return {
          ...state,
          coordination: { ...state.coordination, collectiveSubLevels: sortedCollectiveSubLevels },
        };
      }
    },
    updateOtherClassification(state, action: PayloadAction<IClass | null>) {
      const data = action.payload;

      if (data) {
        const otherClassifications = [...state.coordination.otherClassifications].map((sc) =>
          sc.id === data.id ? data : sc,
        );
        const sortedOtherClassifications = sortClassByName([...otherClassifications]);
        return {
          ...state,
          coordination: { ...state.coordination, otherClassifications: sortedOtherClassifications },
        };
      }
    },
    updateOtherClassificationSubLevel(state, action: PayloadAction<IClass | null>) {
      const data = action.payload;

      if (data) {
        const otherClassificationSubLevels = [
          ...state.coordination.otherClassificationSubLevels,
        ].map((sc) => (sc.id === data.id ? data : sc));
        const sortedOtherClassificationSubLevels = sortClassByName([
          ...otherClassificationSubLevels,
        ]);
        return {
          ...state,
          coordination: {
            ...state.coordination,
            otherClassificationSubLevels: sortedOtherClassificationSubLevels,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    // GET ALL PLANNING
    builder.addCase(
      getPlanningClassesThunk.fulfilled,
      (state, action: PayloadAction<Array<IClass>>) => {
        return {
          ...state,
          planning: separateClassesIntoHierarchy(action.payload, false),
        };
      },
    );
    builder.addCase(getPlanningClassesThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GET ALL COORDINATION
    builder.addCase(
      getCoordinationClassesThunk.fulfilled,
      (state, action: PayloadAction<Array<IClass>>) => {
        return {
          ...state,
          coordination: separateClassesIntoHierarchy(
            action.payload,
            true,
          ) as ICoordinatorClassHierarchy,
        };
      },
    );
    builder.addCase(
      getCoordinationClassesThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const {
  updateMasterClass,
  updateClass,
  updateSubClass,
  updateCollectiveSubLevel,
  updateOtherClassification,
  updateOtherClassificationSubLevel,
} = classSlice.actions;

export const selectAllPlanningClasses = (state: RootState) => state.class.planning.allClasses;
export const selectPlanningMasterClasses = (state: RootState) => state.class.planning.masterClasses;
export const selectPlanningClasses = (state: RootState) => state.class.planning.classes;
export const selectPlanningSubClasses = (state: RootState) => state.class.planning.subClasses;
export const selectBatchedPlanningClasses = (state: RootState) => state.class.planning;
export const selectBatchedCoordinationClasses = (state: RootState) => state.class.coordination;

export default classSlice.reducer;
