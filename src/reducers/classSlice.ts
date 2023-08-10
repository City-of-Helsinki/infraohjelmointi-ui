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
 * Parses a class name and returns the number value at the beginning of the name.
 */
const parseNumberFromClassName = (name: string, type: 'masterClass' | 'class' | 'subClass') => {
  const index = type === 'masterClass' ? 0 : type === 'class' ? 2 : 3;

  const number = parseInt(name.split(' ')[index]);

  return number;
};

/**
 * Sorts a list of classes by their numerical value
 */
const sortClassByNumber = (classes: Array<IClass>, type: 'masterClass' | 'class' | 'subClass') =>
  [...classes].sort(
    (a, b) => parseNumberFromClassName(a.name, type) - parseNumberFromClassName(b.name, type),
  );

const getClassesForParents = (allClasses: Array<IClass>, parents: Array<IClass>) =>
  parent ? allClasses?.filter((ac) => parents.findIndex((p) => p.id === ac.parent) !== -1) : [];

const separateClassesIntoHierarchy = (allClasses: Array<IClass>, forCoordinator: boolean) => {
  const getClasses = (parents: Array<IClass>) => getClassesForParents(allClasses, parents);

  const masterClasses = allClasses?.filter((ac) => !ac.parent);
  const sortedMasterClasses = sortClassByNumber([...masterClasses], 'masterClass');
  const classes = getClasses(masterClasses);
  const subClasses = getClasses(classes);

  if (!forCoordinator) {
    return {
      allClasses,
      masterClasses: sortedMasterClasses,
      classes,
      subClasses,
      year: classes[0]?.finances?.year,
    };
  }

  const sortedClasses = sortClassByNumber([...classes], 'class');
  const sortedSubClasses = sortClassByNumber([...subClasses], 'subClass');
  const collectiveSubLevels = getClasses(subClasses);
  const otherClassifications = getClasses(collectiveSubLevels);
  const otherClassificationSubLevels = getClasses(otherClassifications);

  return {
    allClasses,
    masterClasses: sortedMasterClasses,
    classes: sortedClasses,
    subClasses: sortedSubClasses,
    collectiveSubLevels,
    otherClassifications,
    otherClassificationSubLevels,
    year: classes[0]?.finances?.year,
  };
};

export const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    updatePlanningMasterClass(state, action: PayloadAction<IClass | null>) {
      const masterClassToUpdate = action.payload;

      if (masterClassToUpdate) {
        const masterClasses = [...state.planning.masterClasses].map((mc) =>
          mc.id === masterClassToUpdate.id ? masterClassToUpdate : mc,
        );
        const sortedMasterClasses = sortClassByNumber([...masterClasses], 'masterClass');
        return { ...state, planning: { ...state.planning, masterClasses: sortedMasterClasses } };
      }
    },
    updatePlanningClass(state, action: PayloadAction<IClass | null>) {
      const classToUpdate = action.payload;

      if (classToUpdate) {
        const classes = [...state.planning.classes].map((c) =>
          c.id === classToUpdate.id ? classToUpdate : c,
        );
        return { ...state, planning: { ...state.planning, classes } };
      }
    },
    updatePlanningSubClass(state, action: PayloadAction<IClass | null>) {
      const subClassToUpdate = action.payload;

      if (subClassToUpdate) {
        const subClasses = [...state.planning.subClasses].map((sc) =>
          sc.id === subClassToUpdate.id ? subClassToUpdate : sc,
        );
        return { ...state, planning: { ...state.planning, subClasses } };
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

export const { updatePlanningMasterClass, updatePlanningClass, updatePlanningSubClass } =
  classSlice.actions;

export const selectAllPlanningClasses = (state: RootState) => state.class.planning.allClasses;
export const selectPlanningMasterClasses = (state: RootState) => state.class.planning.masterClasses;
export const selectPlanningClasses = (state: RootState) => state.class.planning.classes;
export const selectPlanningSubClasses = (state: RootState) => state.class.planning.subClasses;
export const selectBatchedPlanningClasses = (state: RootState) => state.class.planning;
export const selectBatchedCoordinationClasses = (state: RootState) => state.class.coordination;

export default classSlice.reducer;
