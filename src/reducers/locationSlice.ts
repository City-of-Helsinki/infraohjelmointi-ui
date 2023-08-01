import { IError } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getCoordinatorLocations, getPlanningLocations } from '@/services/locationService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILocationHierarchy {
  allLocations: Array<ILocation>;
  districts: Array<ILocation>;
  divisions: Array<ILocation>;
  subDivisions: Array<ILocation>;
  year: number;
}

interface ILocationState {
  planning: ILocationHierarchy;
  coordination: Omit<ILocationHierarchy, 'allLocations' | 'divisions' | 'subDivisions'>;
  error: unknown;
}

const initialLocations = {
  allLocations: [],
  districts: [],
  divisions: [],
  subDivisions: [],
  year: new Date().getFullYear(),
};

const initialCoordinatorLocations = {
  districts: [],
  year: new Date().getFullYear(),
};

const initialState: ILocationState = {
  planning: initialLocations,
  coordination: initialCoordinatorLocations,
  error: null,
};

export const getPlanningLocationsThunk = createAsyncThunk(
  'location/getAllPlanning',
  async (_, thunkAPI) => {
    return await getPlanningLocations()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getCoordinationLocationsThunk = createAsyncThunk(
  'location/getAllCoordinator',
  async (_, thunkAPI) => {
    return await getCoordinatorLocations()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

const getLocationsForParent = (allLocations: Array<ILocation>, parents: Array<ILocation>) =>
  parent ? allLocations?.filter((al) => parents.findIndex((p) => p.id === al.parent) !== -1) : [];

const separateLocationsIntoHierarchy = (
  allLocations: Array<ILocation>,
  forCoordinator: boolean,
) => {
  const districts = allLocations?.filter((al) => !al.parent);

  if (forCoordinator) {
    return {
      districts,
      year: allLocations[0]?.finances?.year,
    };
  }

  const getLocations = (parents: Array<ILocation>) => getLocationsForParent(allLocations, parents);

  const divisions = getLocations(districts);
  const subDivisions = getLocations(divisions);

  return {
    districts,
    allLocations,
    divisions,
    subDivisions,
    year: allLocations[0].finances.year,
  };
};

export const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    updatePlanningDistrict(state, action: PayloadAction<ILocation | null>) {
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
    // GET ALL PLANNING
    builder.addCase(
      getPlanningLocationsThunk.fulfilled,
      (state, action: PayloadAction<Array<ILocation>>) => {
        return {
          ...state,
          planning: separateLocationsIntoHierarchy(action.payload, false) as ILocationHierarchy,
        };
      },
    );
    builder.addCase(getPlanningLocationsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GET ALL COORDINATION
    builder.addCase(
      getCoordinationLocationsThunk.fulfilled,
      (state, action: PayloadAction<Array<ILocation>>) => {
        return {
          ...state,
          coordination: separateLocationsIntoHierarchy(action.payload, true),
        };
      },
    );
    builder.addCase(
      getCoordinationLocationsThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const { updatePlanningDistrict } = locationSlice.actions;

export const selectPlanningDistricts = (state: RootState) => state.location.planning.districts;
export const selectPlanningDivisions = (state: RootState) => state.location.planning.divisions;
export const selectPlanningSubDivisions = (state: RootState) =>
  state.location.planning.subDivisions;
export const selectBatchedPlanningLocations = (state: RootState) => state.location.planning;
export const selectBatchedCoordinationLocations = (state: RootState) => state.location.coordination;
export const selectCoordinationDistricts = (state: RootState) =>
  state.location.coordination.districts;

export default locationSlice.reducer;
