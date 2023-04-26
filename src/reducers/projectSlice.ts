import { IError } from '@/interfaces/common';
import { IProject, IProjectPatchRequestObject } from '@/interfaces/projectInterfaces';
import { getProject, patchProject } from '@/services/projectServices';
import { RootState } from '@/store';
import { getCurrentTime } from '@/utils/dates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export const getProjectThunk = createAsyncThunk('project/getOne', async (id: string, thunkAPI) => {
  thunkAPI.dispatch(resetProject());
  return await getProject(id)
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const patchProjectThunk = createAsyncThunk(
  'project/silent-patch',
  async (request: IProjectPatchRequestObject, thunkAPI) => {
    return await patchProject(request)
      .then((res) => res)
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
    resetProject(state) {
      return { ...state, selectedProject: null };
    },
  },
  extraReducers: (builder) => {
    // GET ONE
    builder.addCase(getProjectThunk.fulfilled, (state, action: PayloadAction<IProject>) => {
      return { ...state, selectedProject: action.payload };
    });
    builder.addCase(getProjectThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // SILENT PATCH
    builder.addCase(patchProjectThunk.fulfilled, (state, action: PayloadAction<IProject>) => {
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
      patchProjectThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const selectProject = (state: RootState) => state.project.selectedProject;
export const selectProjects = (state: RootState) => state.project.projects;
export const selectCount = (state: RootState) => state.project.count;
export const selectPage = (state: RootState) => state.project.page;
export const selectUpdated = (state: RootState) => state.project.updated;

export const { setPage, resetProjects, resetProject } = projectSlice.actions;

export default projectSlice.reducer;
