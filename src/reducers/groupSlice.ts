import { groupApi } from '@/api/groupApi';
import { IGroup } from '@/interfaces/groupInterfaces';
import { getErrorFromRejectedAction } from '@/utils/reduxErrorUtils';
import { RootState } from '@/store';
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';

interface IGroupUpdatePayload {
  data: IGroup | null;
  type: 'coordination' | 'planning' | 'forcedToFrame';
}
interface IGroupsState {
  planning: { groups: Array<IGroup>; year: number };
  coordination: { groups: Array<IGroup>; year: number };
  forcedToFrame: { groups: Array<IGroup>; year: number };
  error: unknown;
}

const initialState: IGroupsState = {
  planning: { groups: [], year: new Date().getFullYear() },
  coordination: { groups: [], year: new Date().getFullYear() },
  forcedToFrame: { groups: [], year: new Date().getFullYear() },
  error: null,
};

const toGroupsState = (groups: Array<IGroup>) => ({ year: groups[0]?.finances?.year, groups });

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setPlanningGroups(state, action: PayloadAction<Array<IGroup>>) {
      return { ...state, planning: toGroupsState(action.payload) };
    },
    setCoordinationGroups(state, action: PayloadAction<Array<IGroup>>) {
      return { ...state, coordination: toGroupsState(action.payload) };
    },
    setForcedToFrameGroups(state, action: PayloadAction<Array<IGroup>>) {
      return { ...state, forcedToFrame: toGroupsState(action.payload) };
    },
    updateGroup(state, action: PayloadAction<IGroupUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const groups = [...state[type].groups].map((g) => (g.id === data.id ? data : g));
        return { ...state, [type]: { ...state[type], groups } };
      }
    },
  },
  // Query results are not synced here: ReportRow fetches other years via the same endpoints.
  extraReducers: (builder) => {
    builder.addMatcher(groupApi.endpoints.postGroup.matchFulfilled, (state, action) => {
      state.planning.groups.push(action.payload);
    });
    builder.addMatcher(groupApi.endpoints.patchGroup.matchFulfilled, (state, action) => {
      state.planning.groups = state.planning.groups.map((g) =>
        g.id === action.payload.id ? action.payload : g,
      );
    });
    builder.addMatcher(groupApi.endpoints.deleteGroup.matchFulfilled, (state, action) => {
      const id = action.meta.arg.originalArgs;
      state.planning.groups = state.planning.groups.filter((g) => g.id !== id);
      state.coordination.groups = state.coordination.groups.filter((g) => g.id !== id);
    });
    builder.addMatcher(
      isAnyOf(
        groupApi.endpoints.getPlanningGroups.matchRejected,
        groupApi.endpoints.getCoordinationGroups.matchRejected,
        groupApi.endpoints.postGroup.matchRejected,
        groupApi.endpoints.patchGroup.matchRejected,
        groupApi.endpoints.deleteGroup.matchRejected,
      ),
      (state, action) => {
        state.error = getErrorFromRejectedAction(action);
      },
    );
  },
});

export const { setPlanningGroups, setCoordinationGroups, setForcedToFrameGroups, updateGroup } =
  groupSlice.actions;
export const selectForcedToFrameGroups = (state: RootState) => state.group.forcedToFrame.groups;
export const selectCoordinationGroups = (state: RootState) => state.group.coordination.groups;
export const selectPlanningGroups = (state: RootState) => state.group.planning.groups;
export default groupSlice.reducer;
