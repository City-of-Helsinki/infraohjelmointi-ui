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

interface IClassState {
  planning: IClassHierarchy;
  coordination: IClassHierarchy;
  error: unknown;
}

const initialClasses = {
  allClasses: [],
  masterClasses: [],
  classes: [],
  subClasses: [],
  year: new Date().getFullYear(),
};

const initialState: IClassState = {
  planning: initialClasses,
  coordination: initialClasses,
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

const separateClassesIntoHierarchy = (allClasses: Array<IClass>) => {
  const masterClasses = allClasses?.filter((c) => !c.parent);

  const classes = masterClasses
    ? allClasses?.filter((c) => masterClasses.findIndex((mc) => mc.id === c.parent) !== -1)
    : [];

  const subClasses = classes
    ? allClasses?.filter((c) => classes.findIndex((sc) => sc.id === c.parent) !== -1)
    : [];

  return {
    allClasses,
    masterClasses,
    classes,
    subClasses,
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
          planning: separateClassesIntoHierarchy(action.payload),
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
          coordination: separateClassesIntoHierarchy(action.payload),
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

export default classSlice.reducer;
