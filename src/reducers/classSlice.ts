import { IClass } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import { getClasses } from '@/services/classService';
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

export const { setMasterClasses, setClasses, setSubClasses } = classSlice.actions;

export default classSlice.reducer;
