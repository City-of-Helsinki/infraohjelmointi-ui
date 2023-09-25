import { IError } from '@/interfaces/common';
import { IGroup, IGroupRequest } from '@/interfaces/groupInterfaces';
import { deleteGroup, getGroups, postGroup } from '@/services/groupServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IGroupsState {
  groups: Array<IGroup>;
  year: number;
  error: unknown;
}

const initialState: IGroupsState = {
  groups: [],
  year: new Date().getFullYear(),
  error: null,
};

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

export const getGroupsThunk = createAsyncThunk('group/getAll', async (year: number, thunkAPI) => {
  try {
    const groups = await getGroups(year);
    return groups;
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    updateGroup(state, action: PayloadAction<IGroup | null>) {
      const groupToUpdate = action.payload;

      if (groupToUpdate) {
        const groups = [...state.groups].map((g) =>
          g.id === groupToUpdate.id ? groupToUpdate : g,
        );
        return { ...state, groups };
      }
    },
  },
  extraReducers: (builder) => {
    // GROUP POST
    builder.addCase(postGroupThunk.fulfilled, (state, action: PayloadAction<IGroup>) => {
      return { ...state, groups: [...state.groups, action.payload] };
    });
    builder.addCase(postGroupThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GROUP GET ALL
    builder.addCase(getGroupsThunk.fulfilled, (state, action: PayloadAction<Array<IGroup>>) => {
      return { ...state, groups: action.payload, year: action.payload[0]?.finances?.year };
    });
    builder.addCase(getGroupsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GROUP DELETE
    builder.addCase(deleteGroupThunk.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
      return { ...state, groups: state.groups.filter((g) => g.id !== action.payload.id) };
    });
    builder.addCase(deleteGroupThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const { updateGroup } = groupSlice.actions;
export const selectGroups = (state: RootState) => state.group.groups;

export default groupSlice.reducer;
