import { IClass } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import { getCoordinationClasses, getPlanningClasses } from '@/services/classService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IClassHierarchy {
  allClasses: Array<IClass>;
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  year: number;
}

interface ICoordinatorClassHierarchy extends IClassHierarchy {
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

const separateClassesIntoHierarchy = (allClasses: Array<IClass>, forCoordinator: boolean) => {
  const masterClasses = allClasses?.filter((ac) => !ac.parent);

  const classes = masterClasses
    ? allClasses?.filter((ac) => masterClasses.findIndex((mc) => mc.id === ac.parent) !== -1)
    : [];

  const subClasses = classes
    ? allClasses?.filter((ac) => classes.findIndex((c) => c.id === ac.parent) !== -1)
    : [];

  const collectiveSubLevels: Array<IClass> = [];
  const otherClassifications: Array<IClass> = [];
  const otherClassificationSubLevels: Array<IClass> = [];

  if (forCoordinator) {
    if (subClasses.length > 0) {
      allClasses?.forEach((al) => {
        if (subClasses.findIndex((d) => d.id === al.parent) !== -1) {
          collectiveSubLevels.push(al);
        }
      });
    }

    if (collectiveSubLevels.length > 0) {
      allClasses?.forEach((al) => {
        if (collectiveSubLevels.findIndex((d) => d.id === al.parent) !== -1) {
          otherClassifications.push(al);
        }
      });
    }

    if (otherClassifications.length > 0) {
      allClasses?.forEach((al) => {
        if (otherClassifications.findIndex((d) => d.id === al.parent) !== -1) {
          otherClassificationSubLevels.push(al);
        }
      });
    }
  }

  return {
    allClasses,
    masterClasses,
    classes,
    subClasses,
    ...(forCoordinator && {
      collectiveSubLevels,
      otherClassifications,
      otherClassificationSubLevels,
    }),
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
        return { ...state, planning: { ...state.planning, masterClasses } };
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
