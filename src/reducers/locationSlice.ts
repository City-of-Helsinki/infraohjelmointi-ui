import { locationApi } from '@/api/locationApi';
import { ILocation } from '@/interfaces/locationInterfaces';
import { RootState } from '@/store';
import { getErrorFromRejectedAction } from '@/utils/reduxErrorUtils';
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';

export interface ILocationHierarchy {
  allLocations: Array<ILocation>;
  districts: Array<ILocation>;
  divisions: Array<ILocation>;
  subDivisions: Array<ILocation>;
  year: number;
}

interface ILocationState {
  planning: ILocationHierarchy;
  coordination: Omit<ILocationHierarchy, 'allLocations' | 'divisions' | 'subDivisions'>;
  forcedToFrame: Omit<ILocationHierarchy, 'allLocations' | 'divisions' | 'subDivisions'>;
  error: unknown;
}

interface ILocationUpdatePayload {
  data: ILocation | null;
  type: 'coordination' | 'planning' | 'forcedToFrame';
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
  forcedToFrame: initialCoordinatorLocations,
  error: null,
};

const getLocationsForParent = (allLocations: Array<ILocation>, parents: Array<ILocation>) =>
  parents.length
    ? allLocations?.filter((al) => parents.findIndex((p) => p.id === al.parent) !== -1)
    : [];

export const separateLocationsIntoHierarchy = (
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
    year: allLocations[0]?.finances?.year ?? new Date().getFullYear(),
  };
};

export const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setPlanningLocations(state, action: PayloadAction<Array<ILocation>>) {
      return {
        ...state,
        planning: separateLocationsIntoHierarchy(action.payload, false) as ILocationHierarchy,
      };
    },
    setCoordinationLocations(state, action: PayloadAction<Array<ILocation>>) {
      return { ...state, coordination: separateLocationsIntoHierarchy(action.payload, true) };
    },
    setForcedToFrameLocations(state, action: PayloadAction<Array<ILocation>>) {
      return { ...state, forcedToFrame: separateLocationsIntoHierarchy(action.payload, true) };
    },
    updateDistrict(state, action: PayloadAction<ILocationUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const districts = [...state[type].districts].map((d) => (d.id === data.id ? data : d));
        return { ...state, [type]: { ...state[type], districts } };
      }
    },
  },
  // Fulfilled results are not synced here: ReportRow fetches other years via the same endpoints.
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        locationApi.endpoints.getPlanningLocations.matchRejected,
        locationApi.endpoints.getCoordinationLocations.matchRejected,
      ),
      (state, action) => {
        state.error = getErrorFromRejectedAction(action);
      },
    );
  },
});

export const {
  setPlanningLocations,
  setCoordinationLocations,
  setForcedToFrameLocations,
  updateDistrict,
} = locationSlice.actions;

export const selectPlanningDistricts = (state: RootState) => state.location.planning.districts;
export const selectPlanningDivisions = (state: RootState) => state.location.planning.divisions;
export const selectPlanningSubDivisions = (state: RootState) =>
  state.location.planning.subDivisions;
export const selectBatchedPlanningLocations = (state: RootState) => state.location.planning;
export const selectBatchedCoordinationLocations = (state: RootState) => state.location.coordination;
export const selectBatchedForcedToFrameLocations = (state: RootState) =>
  state.location.forcedToFrame;
export const selectCoordinationDistricts = (state: RootState) =>
  state.location.coordination.districts;

export default locationSlice.reducer;
