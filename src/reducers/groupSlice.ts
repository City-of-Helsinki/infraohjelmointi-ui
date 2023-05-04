import { IError } from '@/interfaces/common';
import { IGroup, IGroupRequest } from '@/interfaces/groupInterfaces';
import { getGroups, postGroup } from '@/services/groupService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IGroupsState {
  groups: Array<IGroup>;
  year: number;
  error: IError | null | unknown;
}

const initialState: IGroupsState = {
  groups: [],
  year: new Date().getFullYear(),
  error: null,
};

export const postGroupThunk = createAsyncThunk(
  'group/post',
  async (request: IGroupRequest, thunkAPI) => {
    return await postGroup(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getGroupsThunk = createAsyncThunk('group/getAll', async (_, thunkAPI) => {
  return await getGroups()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    updateGroup(state, action: PayloadAction<IGroup>) {
      const updatedGroups = [...state.groups].map((g) =>
        g.id === action.payload.id ? action.payload : g,
      );
      return { ...state, groups: updatedGroups };
    },
  },
  extraReducers: (builder) => {
    // GROUP POST
    builder.addCase(postGroupThunk.fulfilled, (state, action: PayloadAction<IGroup>) => {
      return { ...state, groups: [...state.groups, action.payload] };
    });
    builder.addCase(postGroupThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // GROUP GET ALL
    builder.addCase(getGroupsThunk.fulfilled, (state, action: PayloadAction<Array<IGroup>>) => {
      return { ...state, groups: action.payload, year: action.payload[0].finances.year };
    });
    builder.addCase(getGroupsThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const { updateGroup } = groupSlice.actions;
export const selectGroups = (state: RootState) => state.group.groups;

export default groupSlice.reducer;
