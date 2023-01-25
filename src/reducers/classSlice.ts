import { IClass } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import { getClasses } from '@/services/classService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IClassState {
  allClasses: Array<IClass>;
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  selectedMasterClass: IClass | null;
  selectedClass: IClass | null;
  selectedSubClass: IClass | null;
  error: IError | null | unknown;
}

const initialState: IClassState = {
  allClasses: [],
  masterClasses: [],
  classes: [],
  subClasses: [],
  selectedMasterClass: null,
  selectedClass: null,
  selectedSubClass: null,
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
  reducers: {
    setMasterClasses(state) {
      return { ...state, masterClasses: state.allClasses?.filter((c) => !c.parent) };
    },
    setClasses(state) {
      return {
        ...state,
        classes: state.masterClasses
          ? state.allClasses?.filter(
              (c) => state.masterClasses.findIndex((mc) => mc.id === c.parent) !== -1,
            )
          : [],
      };
    },
    setSubClasses(state) {
      return {
        ...state,
        subClasses: state.classes
          ? state.allClasses?.filter(
              (c) => state.classes.findIndex((sc) => sc.id === c.parent) !== -1,
            )
          : [],
      };
    },
    setSelectedMasterClass(state, action: PayloadAction<IClass | null>) {
      return { ...state, selectedMasterClass: action.payload };
    },
    setSelectedClass(state, action: PayloadAction<IClass | null>) {
      return { ...state, selectedClass: action.payload };
    },
    setSelectedSubClass(state, action: PayloadAction<IClass | null>) {
      return { ...state, selectedSubClass: action.payload };
    },
  },
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(getClassesThunk.fulfilled, (state, action: PayloadAction<Array<IClass>>) => {
      return { ...state, allClasses: [...action.payload] };
    });
    builder.addCase(getClassesThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const {
  setMasterClasses,
  setClasses,
  setSubClasses,
  setSelectedMasterClass,
  setSelectedClass,
  setSelectedSubClass,
} = classSlice.actions;

export default classSlice.reducer;
