import { IError } from '@/interfaces/common';
import { IGroup, IGroupRequest } from '@/interfaces/groupInterfaces';
import { deleteGroup, getCoordinatorGroups, getPlanningGroups, postGroup } from '@/services/groupServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IGroupUpdatePayload {
  data: IGroup | null;
  type: 'coordination' | 'planning';
}
interface IGroupsState {
  planning: { groups: Array<IGroup>; year: number };
  coordination: { groups: Array<IGroup>; year: number };
  error: unknown;
}

const initialState: IGroupsState = {
  planning: { groups: [], year: new Date().getFullYear() },
  coordination: { groups: [], year: new Date().getFullYear() },
  error: null,
};
export const getCoordinationGroupsThunk = createAsyncThunk(
  'group/getAllCoordinator',
  async (year:number, thunkAPI) => {
    return await getCoordinatorGroups(year)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);
export const postGroupThunk = createAsyncThunk(
  'group/post',
  async (request: IGroupRequest, thunkAPI) => {
    try {
      const group = await postGroup(request);
      return group;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const deleteGroupThunk = createAsyncThunk('group/delete', async (id: string, thunkAPI) => {
  try {
    const res = await deleteGroup(id);
    return res;
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export const getPlanningGroupsThunk = createAsyncThunk('group/getAllPlanning', async (year: number, thunkAPI) => {
  try {
    const groups = await getPlanningGroups(year);
    return groups;
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    updateGroup(state, action: PayloadAction<IGroupUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const groups = [...state[type].groups].map((g) => (g.id === data.id ? data : g));
        return { ...state, [type]: { ...state[type], groups } };
      }
    },
  },
  extraReducers: (builder) => {
    // GROUP POST
    builder.addCase(postGroupThunk.fulfilled, (state, action: PayloadAction<IGroup>) => {
      return {
        ...state,
        planning: { groups: [...state.planning.groups, action.payload], year: 2023 },
      };
    });
    builder.addCase(postGroupThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GROUP GET ALL
    builder.addCase(getPlanningGroupsThunk.fulfilled, (state, action: PayloadAction<Array<IGroup>>) => {
      return {
        ...state,
        planning: { year: action.payload[0]?.finances?.year, groups: action.payload },
      };
    });
    builder.addCase(getPlanningGroupsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GROUP DELETE
    builder.addCase(deleteGroupThunk.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
      return {
        ...state,
        planning: {
          ...state.planning,
          groups: state.planning.groups.filter((g) => g.id !== action.payload.id),
        },
        coordination: {
          ...state.coordination,
          groups: state.coordination.groups.filter((g) => g.id !== action.payload.id),
        },
      };
    });
    builder.addCase(deleteGroupThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // GET ALL COORDINATION
    builder.addCase(
      getCoordinationGroupsThunk.fulfilled,
      (state, action: PayloadAction<Array<IGroup>>) => {
        return {
          ...state,
          coordination: { year: action.payload[0]?.finances?.year, groups: action.payload },
        };
      },
    );
    builder.addCase(
      getCoordinationGroupsThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const { updateGroup } = groupSlice.actions;
export const selectCoordinationGroups = (state: RootState) => state.group.coordination.groups;
export const selectPlanningGroups = (state: RootState) => state.group.planning.groups;
export default groupSlice.reducer;
