import { IError } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getLocations } from '@/services/locationService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILocationState {
  allLocations: Array<ILocation>;
  districts: Array<ILocation>;
  divisions: Array<ILocation>;
  subDivisions: Array<ILocation>;
  error: IError | null | unknown;
}

const initialState: ILocationState = {
  allLocations: [],
  districts: [],
  divisions: [],
  subDivisions: [],
  error: null,
};

export const getLocationsThunk = createAsyncThunk('location/getAll', async (_, thunkAPI) => {
  return await getLocations()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setDistricts(state) {
      return { ...state, districts: state.allLocations?.filter((al) => !al.parent) };
    },
    setDivisions(state) {
      return {
        ...state,
        divisions: state.districts
          ? state.allLocations?.filter(
              (al) => state.districts.findIndex((d) => d.id === al.parent) !== -1,
            )
          : [],
      };
    },
    setSubDivisions(state) {
      return {
        ...state,
        subDivisions: state.divisions
          ? state.allLocations?.filter(
              (al) => state.divisions.findIndex((d) => d.id === al.parent) !== -1,
            )
          : [],
      };
    },
  },
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(
      getLocationsThunk.fulfilled,
      (state, action: PayloadAction<Array<ILocation>>) => {
        return { ...state, allLocations: [...action.payload] };
      },
    );
    builder.addCase(
      getLocationsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const selectAllLocations = (state: RootState) => state.location.allLocations;
export const selectDistricts = (state: RootState) => state.location.districts;
export const selectDivisions = (state: RootState) => state.location.divisions;
export const selectSubDivisions = (state: RootState) => state.location.subDivisions;

export const { setDistricts, setDivisions, setSubDivisions } = locationSlice.actions;

export default locationSlice.reducer;
