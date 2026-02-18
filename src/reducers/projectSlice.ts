import { projectApi } from '@/api/projectApi';
import { IError } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { RootState } from '@/store';
import { getErrorFromRejectedAction } from '@/utils/reduxErrorUtils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IProjectState {
  selectedProject: IProject | null;
  count: number | null;
  page: number;
  error: IError | null;
  isSaving: boolean;
  mode: 'edit' | 'new';
}

const initialState: IProjectState = {
  selectedProject: null,
  count: null,
  error: null,
  page: 0,
  isSaving: false,
  mode: 'edit',
};

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
    resetProject(state) {
      return { ...state, selectedProject: null };
    },
    setSelectedProject(state, action: PayloadAction<IProject>) {
      return { ...state, selectedProject: action.payload };
    },
    setIsSaving(state, action: PayloadAction<boolean>) {
      return { ...state, isSaving: action.payload };
    },
    setProjectMode(state, action: PayloadAction<'edit' | 'new'>) {
      return { ...state, mode: action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(projectApi.endpoints.getProjectById.matchPending, (state) => {
        state.error = null;
        state.selectedProject = null;
      })
      .addMatcher(projectApi.endpoints.getProjectById.matchFulfilled, (state, action) => {
        state.selectedProject = action.payload;
        state.error = null;
      })
      .addMatcher(projectApi.endpoints.getProjectById.matchRejected, (state, action) => {
        state.selectedProject = null;
        state.error = getErrorFromRejectedAction(action);
      });
  },
});

export const selectProject = (state: RootState) => state.project.selectedProject;
export const selectCount = (state: RootState) => state.project.count;
export const selectPage = (state: RootState) => state.project.page;
export const selectIsProjectSaving = (state: RootState) => state.project.isSaving;
export const selectProjectMode = (state: RootState) => state.project.mode;

export const { setPage, resetProject, setSelectedProject, setIsSaving, setProjectMode } =
  projectSlice.actions;

export default projectSlice.reducer;
