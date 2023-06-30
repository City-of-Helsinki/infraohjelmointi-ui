import { IClass } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import { getPlanningClasses } from '@/services/classService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IClassState {
  planning: {
    allClasses: Array<IClass>;
    masterClasses: Array<IClass>;
    classes: Array<IClass>;
    subClasses: Array<IClass>;
    year: number;
  };
  error: unknown;
}

const initialState: IClassState = {
  planning: {
    allClasses: [],
    masterClasses: [],
    classes: [],
    subClasses: [],
    year: new Date().getFullYear(),
  },
  error: null,
};

export const getPlanningClassesThunk = createAsyncThunk('class/getAll', async (_, thunkAPI) => {
  return await getPlanningClasses()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

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
    // GET ALL
    builder.addCase(
      getPlanningClassesThunk.fulfilled,
      (state, action: PayloadAction<Array<IClass>>) => {
        const masterClasses = action.payload?.filter((c) => !c.parent);

        const classes = masterClasses
          ? action.payload?.filter(
              (c) => masterClasses.findIndex((mc) => mc.id === c.parent) !== -1,
            )
          : [];

        const subClasses = classes
          ? action.payload?.filter((c) => classes.findIndex((sc) => sc.id === c.parent) !== -1)
          : [];

        return {
          ...state,
          planning: {
            allClasses: action.payload,
            masterClasses,
            classes,
            subClasses,
            year: action.payload[0].finances.year,
          },
        };
      },
    );
    builder.addCase(getPlanningClassesThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
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
