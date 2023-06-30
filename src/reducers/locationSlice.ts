import { IError } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getPlanningLocations } from '@/services/locationService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILocationState {
  planning: {
    allLocations: Array<ILocation>;
    districts: Array<ILocation>;
    divisions: Array<ILocation>;
    subDivisions: Array<ILocation>;
    year: number;
  };

  error: unknown;
}

const initialState: ILocationState = {
  planning: {
    allLocations: [],
    districts: [],
    divisions: [],
    subDivisions: [],
    year: new Date().getFullYear(),
  },
  error: null,
};

export const getPlanningLocationsThunk = createAsyncThunk(
  'location/getAll',
  async (_, thunkAPI) => {
    return await getPlanningLocations()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    updateDistrict(state, action: PayloadAction<ILocation | null>) {
      const districtToUpdate = action.payload;

      if (districtToUpdate) {
        const districts = [...state.planning.districts].map((d) =>
          d.id === districtToUpdate.id ? districtToUpdate : d,
        );
        return { ...state, planning: { ...state.planning, districts } };
      }
    },
  },
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(
      getPlanningLocationsThunk.fulfilled,
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
          planning: {
            allLocations: action.payload,
            districts,
            divisions,
            subDivisions,
            year: action.payload[0].finances.year,
          },
        };
      },
    );
    builder.addCase(getPlanningLocationsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const { updateDistrict } = locationSlice.actions;

export const selectAllLocations = (state: RootState) => state.location.planning.allLocations;
export const selectDistricts = (state: RootState) => state.location.planning.districts;
export const selectDivisions = (state: RootState) => state.location.planning.divisions;
export const selectSubDivisions = (state: RootState) => state.location.planning.subDivisions;
export const selectedBatchedLocations = (state: RootState) => state.location.planning;

export default locationSlice.reducer;
