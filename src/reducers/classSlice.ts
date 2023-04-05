import { IClass } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import { getClasses } from '@/services/classService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IClassState {
  allClasses: Array<IClass>;
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  error: IError | null | unknown;
}

const initialState: IClassState = {
  allClasses: [],
  masterClasses: [],
  classes: [],
  subClasses: [],
  error: null,
};

export const getClassesThunk = createAsyncThunk('class/getAll', async (_, thunkAPI) => {
  return await getClasses()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(getClassesThunk.fulfilled, (state, action: PayloadAction<Array<IClass>>) => {
      const masterClasses = action.payload?.filter((c) => !c.parent);
      const classes = masterClasses
        ? action.payload?.filter((c) => masterClasses.findIndex((mc) => mc.id === c.parent) !== -1)
        : [];
      const subClasses = classes
        ? action.payload?.filter((c) => classes.findIndex((sc) => sc.id === c.parent) !== -1)
        : [];
      return { ...state, allClasses: [...action.payload], masterClasses, classes, subClasses };
    });
    builder.addCase(getClassesThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectAllClasses = (state: RootState) => state.class.allClasses;
export const selectMasterClasses = (state: RootState) => state.class.masterClasses;
export const selectClasses = (state: RootState) => state.class.classes;
export const selectSubClasses = (state: RootState) => state.class.subClasses;

export default classSlice.reducer;
