import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifySuccess } from './notificationSlice';
import {
  ITalpaProjectOpening,
  ITalpaProjectPatchRequestObject,
  ITalpaProjectPostRequestObject,
} from '@/interfaces/talpaInterfaces';
import {
  getTalpaProjectOpeningByProject,
  patchTalpaProjectOpening,
  postTalpaProjectOpening,
} from '@/services/talpaServices';
import { AxiosError } from 'axios';

interface ITalpaState {
  talpaProject: ITalpaProjectOpening | null;
  error: unknown;
}

const initialState: ITalpaState = {
  talpaProject: null,
  error: null,
};

export const getTalpaProjectOpeningByProjectThunk = createAsyncThunk(
  'talpa/getByProject',
  async (projectId: string, thunkAPI) => {
    try {
      const talpaProject = await getTalpaProjectOpeningByProject(projectId);
      return talpaProject;
    } catch (e) {
      if ((e as AxiosError).status === 404) {
        return null;
      }
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const postTalpaProjectOpeningThunk = createAsyncThunk(
  'talpa/post',
  async (request: ITalpaProjectPostRequestObject, thunkAPI) => {
    try {
      const talpaProject = await postTalpaProjectOpening(request);

      thunkAPI.dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: 'talpaProjectPostSuccess',
          type: 'toast',
        }),
      );

      return talpaProject;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const patchTalpaProjectOpeningThunk = createAsyncThunk(
  'talpa/patch',
  async (request: ITalpaProjectPatchRequestObject, thunkAPI) => {
    try {
      const talpaProject = await patchTalpaProjectOpening(request);

      thunkAPI.dispatch(
        notifySuccess({
          title: 'patchSuccess',
          message: 'talpaProjectPatchSuccess',
          type: 'toast',
        }),
      );

      return talpaProject;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

const talpaSlice = createSlice({
  name: 'talpa',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // TALPA PROJECT OPENING GET
    builder.addCase(
      getTalpaProjectOpeningByProjectThunk.fulfilled,
      (state, action: PayloadAction<ITalpaProjectOpening | null>) => {
        return { ...state, talpaProject: action.payload };
      },
    );
    builder.addCase(
      getTalpaProjectOpeningByProjectThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // TALPA PROJECT OPENING POST
    builder.addCase(
      postTalpaProjectOpeningThunk.fulfilled,
      (state, action: PayloadAction<ITalpaProjectOpening>) => {
        return { ...state, talpaProject: action.payload };
      },
    );
    builder.addCase(
      postTalpaProjectOpeningThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // TALPA PROJECT OPENING PATCH
    builder.addCase(
      patchTalpaProjectOpeningThunk.fulfilled,
      (state, action: PayloadAction<ITalpaProjectOpening>) => {
        return { ...state, talpaProject: action.payload };
      },
    );
    builder.addCase(
      patchTalpaProjectOpeningThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const selectTalpaProject = (state: RootState) => state.talpa.talpaProject;

export default talpaSlice.reducer;
