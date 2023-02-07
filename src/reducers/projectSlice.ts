import { IError } from '@/interfaces/common';
import { IProject, IProjectRequestObject, IProjectsResponse } from '@/interfaces/projectInterfaces';
import { getProject, getProjects, patchProject, postProject } from '@/services/projectServices';
import { RootState } from '@/store';
import { getCurrentTime } from '@/utils/common';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifySuccess } from './notificationSlice';

interface IProjectState {
  selectedProject: IProject | null;
  projects: Array<IProject>;
  count: number | null;
  page: number;
  error: IError | null | unknown;
  updated: string | null;
}

const initialState: IProjectState = {
  selectedProject: null,
  projects: [],
  count: null,
  error: null,
  page: 0,
  updated: null,
};

export const getProjectsThunk = createAsyncThunk(
  'project/getAll',
  async (page: number, thunkAPI) => {
    return await getProjects(page)
      .then((res) => {
        thunkAPI.dispatch(setPage(page));
        if ((thunkAPI.getState() as RootState).project.projects.length > 0 && page === 1) {
          thunkAPI.dispatch(resetProjects());
        }
        return res;
      })
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getProjectThunk = createAsyncThunk('project/getOne', async (id: string, thunkAPI) => {
  return await getProject(id)
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const postProjectThunk = createAsyncThunk(
  'project/post',
  async (request: IProjectRequestObject, thunkAPI) => {
    return await postProject(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const silentPatchProjectThunk = createAsyncThunk(
  'project/silent-patch',
  async (request: IProjectRequestObject, thunkAPI) => {
    return await patchProject(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const patchProjectThunk = createAsyncThunk(
  'project/patch',
  async (request: IProjectRequestObject, thunkAPI) => {
    return await patchProject(request)
      .then((res) => {
        thunkAPI.dispatch(
          notifySuccess({
            title: 'sendSuccess',
            message: 'formSaveSuccess',
            type: 'toast',
          }),
        );
        return res;
      })
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      return {
        ...state,
        page: action.payload,
      };
    },
    resetProjects(state) {
      return {
        ...state,
        projects: initialState.projects,
      };
    },
  },
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(
      getProjectsThunk.fulfilled,
      (state, action: PayloadAction<IProjectsResponse>) => {
        return {
          ...state,
          projects: [...state.projects, ...action.payload.results],
          count: action.payload.count,
        };
      },
    );
    builder.addCase(getProjectsThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // GET ONE
    builder.addCase(getProjectThunk.fulfilled, (state, action: PayloadAction<IProject>) => {
      return { ...state, selectedProject: action.payload };
    });
    builder.addCase(getProjectThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // POST
    builder.addCase(postProjectThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // PATCH
    builder.addCase(patchProjectThunk.fulfilled, (state, action: PayloadAction<IProject>) => {
      // All projects also need to be updated to get changes into the planning list
      const updatedProjectList: Array<IProject> = state.projects.map((p) =>
        p.id === action.payload.id ? action.payload : p,
      );
      return {
        ...state,
        selectedProject: action.payload,
        projects: [...updatedProjectList],
      };
    });
    builder.addCase(
      patchProjectThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // SILENT PATCH
    builder.addCase(silentPatchProjectThunk.fulfilled, (state, action: PayloadAction<IProject>) => {
      // All projects also need to be updated to get changes into the planning list
      const updatedProjectList: Array<IProject> = state.projects.map((p) =>
        p.id === action.payload?.id ? action.payload : p,
      );
      return {
        ...state,
        selectedProject: action.payload,
        projects: [...updatedProjectList],
        updated: getCurrentTime(),
      };
    });
    builder.addCase(
      silentPatchProjectThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const { setPage, resetProjects } = projectSlice.actions;

export default projectSlice.reducer;
