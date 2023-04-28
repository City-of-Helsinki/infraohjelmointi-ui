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
  year: number;
  error: IError | null | unknown;
}

const initialState: ILocationState = {
  allLocations: [],
  districts: [],
  divisions: [],
  subDivisions: [],
  year: new Date().getFullYear(),
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
  reducers: {},
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(
      getLocationsThunk.fulfilled,
      (state, action: PayloadAction<Array<ILocation>>) => {
        const districts = action.payload?.filter((l) => !l.parent);

        const divisions = districts
          ? action.payload?.filter((l) => districts.findIndex((d) => d.id === l.parent) !== -1)
          : [];

        const subDivisions = divisions
          ? action.payload?.filter((l) => divisions.findIndex((d) => d.id === l.parent) !== -1)
          : [];

        return {
          ...state,
          allLocations: action.payload,
          districts,
          divisions,
          subDivisions,
          year: action.payload[0].finances.year,
        };
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
export const selectedBatchedLocations = (state: RootState) => state.location;

export default locationSlice.reducer;
