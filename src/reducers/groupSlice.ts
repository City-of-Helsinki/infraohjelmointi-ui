import { IError } from '@/interfaces/common';
import { IGroup, IGroupRequest } from '@/interfaces/groupInterfaces';
import { getGroups, postGroup } from '@/services/groupService';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IGroupsState {
  groups: Array<IGroup>;
  error: IError | null | unknown;
}

const initialState: IGroupsState = {
  groups: [],
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
  reducers: {},
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
      return { ...state, groups: action.payload };
    });
    builder.addCase(getGroupsThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectGroups = (state: RootState) => state.note.notes;

export default groupSlice.reducer;
