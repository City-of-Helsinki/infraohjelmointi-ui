import { IError } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { getProject } from '@/services/projectServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IProjectState {
  selectedProject: IProject | null;
  count: number | null;
  page: number;
  error: unknown;
  isSaving: boolean;
}

const initialState: IProjectState = {
  selectedProject: null,
  count: null,
  error: null,
  page: 0,
  isSaving: false,
};

export const getProjectThunk = createAsyncThunk('project/getOne', async (id: string, thunkAPI) => {
  thunkAPI.dispatch(resetProject());
  return await getProject(id)
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

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
  },
  extraReducers: (builder) => {
    // GET ONE
    builder.addCase(getProjectThunk.fulfilled, (state, action: PayloadAction<IProject>) => {
      return { ...state, selectedProject: action.payload };
    });
    builder.addCase(getProjectThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectProject = (state: RootState) => state.project.selectedProject;
export const selectCount = (state: RootState) => state.project.count;
export const selectPage = (state: RootState) => state.project.page;
export const selectIsProjectSaving = (state: RootState) => state.project.isSaving;

export const { setPage, resetProject, setSelectedProject, setIsSaving } = projectSlice.actions;

export default projectSlice.reducer;
