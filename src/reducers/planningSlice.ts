import { IClass } from '@/interfaces/classInterfaces';
import {
  IPlanningNotesDialogData,
  IPlanningNotesModalData,
  IPlanningRow,
  IPlanningRowSelections,
  PlanningMode,
} from '@/interfaces/planningInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCoordinatorNotes, postCoordinatorNoteToProject } from '@/services/noteServices';
import { IError } from '@/interfaces/common';
import { ICoordinatorNoteRequest } from '@/interfaces/noteInterfaces';

interface ICoordinatorNotesModalOpen {
  isOpen: boolean;
  id: string;
}
interface IPlanningState {
  selectedYear: number | null;
  startYear: number;
  groupsExpanded: boolean;
  searchedProjectId: string | null;
  selections: IPlanningRowSelections;
  projects: Array<IProject>;
  rows: Array<IPlanningRow>;
  mode: PlanningMode;
  forcedToFrame: boolean;
  isLoading: boolean;
  notesDialogOpen: boolean;
  notesDialogData: IPlanningNotesDialogData;
  notesModalOpen: ICoordinatorNotesModalOpen;
  notesModalData: IPlanningNotesModalData;
  coordinatorNotes: ICoordinatorNoteRequest[];
}

export const getCoordinatorNotesThunk = createAsyncThunk(
  'coordinatorNotes/getByProject',
  async (_, thunkAPI) => {
    return await getCoordinatorNotes()
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const postCoordinatorNoteToProjectThunk = createAsyncThunk(
  'coordinatorNotes/postNote',
  async (request: ICoordinatorNoteRequest, thunkAPI) => {
    return await postCoordinatorNoteToProject(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

const initialState: IPlanningState = {
  selectedYear: null,
  startYear: new Date().getFullYear(),
  groupsExpanded: false,
  searchedProjectId: null,
  selections: {
    selectedMasterClass: null,
    selectedClass: null,
    selectedSubClass: null,
    selectedDistrict: null,
    selectedCollectiveSubLevel: null,
    selectedSubLevelDistrict: null,
    selectedOtherClassification: null,
  },
  mode: 'planning',
  projects: [],
  rows: [],
  forcedToFrame: false,
  isLoading: false,
  notesDialogOpen: false,
  notesDialogData: {name: '', id: '', selectedYear: null},
  notesModalOpen: {isOpen: false, id: ''},
  notesModalData: {name: '', id: ''},
  coordinatorNotes: [],
};

export const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    setSelectedYear(state, action: PayloadAction<number | null>) {
      return { ...state, selectedYear: action.payload };
    },
    setStartYear(state, action: PayloadAction<number>) {
      return { ...state, startYear: action.payload };
    },
    setSelectedMasterClass(state, action: PayloadAction<IClass | null>) {
      return { ...state, selections: { ...state.selections, selectedMasterClass: action.payload } };
    },
    setSelectedClass(state, action: PayloadAction<IClass | null>) {
      return { ...state, selections: { ...state.selections, selectedClass: action.payload } };
    },
    setSelectedSubClass(state, action: PayloadAction<IClass | null>) {
      return { ...state, selections: { ...state.selections, selectedSubClass: action.payload } };
    },
    setSelectedDistrict(state, action: PayloadAction<ILocation | null>) {
      return { ...state, selections: { ...state.selections, selectedDistrict: action.payload } };
    },
    setSelectedCollectiveSubLevel(state, action: PayloadAction<IClass | null>) {
      return {
        ...state,
        selections: { ...state.selections, selectedCollectiveSubLevel: action.payload },
      };
    },
    setSelectedSubLevelDistrict(state, action: PayloadAction<ILocation | null>) {
      return {
        ...state,
        selections: { ...state.selections, selectedSubLevelDistrict: action.payload },
      };
    },
    setSelectedOtherClassification(state, action: PayloadAction<IClass | null>) {
      return {
        ...state,
        selections: { ...state.selections, selectedOtherClassification: action.payload },
      };
    },
    setPlanningRows(state, action: PayloadAction<Array<IPlanningRow>>) {
      return { ...state, rows: action.payload };
    },
    setProjects(state, action: PayloadAction<Array<IProject>>) {
      return { ...state, projects: action.payload };
    },
    setGroupsExpanded(state, action: PayloadAction<boolean>) {
      return { ...state, groupsExpanded: action.payload };
    },
    setPlanningMode(state, action: PayloadAction<PlanningMode>) {
      return { ...state, mode: action.payload };
    },
    resetSelections(state) {
      return { ...state, selections: initialState.selections };
    },
    setForcedToFrame(state, action: PayloadAction<boolean>) {
      return { ...state, forcedToFrame: action.payload };
    },
    setIsPlanningLoading(state, action: PayloadAction<boolean>) {
      return { ...state, isLoading: action.payload };
    },
    setNotesDialogOpen(state, action: PayloadAction<boolean>) {
      return { ...state, notesDialogOpen: action.payload}
    },
    setNotesDialogData(state, action: PayloadAction<IPlanningNotesDialogData>) {
      return { ...state, notesDialogData: action.payload}
    },
    setNotesModalOpen(state, action: PayloadAction<ICoordinatorNotesModalOpen>) {
      return { ...state, notesModalOpen: {id: action.payload.id, isOpen:!state.notesModalOpen.isOpen}}
    },
    setNotesModalData(state, action: PayloadAction<IPlanningNotesModalData>) {
      return { ...state, notesModalData: action.payload}
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      getCoordinatorNotesThunk.fulfilled,
      (state, action: PayloadAction<ICoordinatorNoteRequest[]>) => {
        return { ...state, coordinatorNotes: action.payload };
      },
    );
    builder.addCase(
      getCoordinatorNotesThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, coordinatorNotesError: action.payload };
      },
    );
  }
});

export const selectSelectedYear = (state: RootState) => state.planning.selectedYear;
export const selectStartYear = (state: RootState) => state.planning.startYear;
export const selectSelections = (state: RootState) => state.planning.selections;
export const selectPlanningRows = (state: RootState) => state.planning.rows;
export const selectProjects = (state: RootState) => state.planning.projects;
export const selectGroupsExpanded = (state: RootState) => state.planning.groupsExpanded;
export const selectPlanningMode = (state: RootState) => state.planning.mode;
export const selectForcedToFrame = (state: RootState) => state.planning.forcedToFrame;
export const selectIsPlanningLoading = (state: RootState) => state.planning.isLoading;
export const selectNotesDialogOpen = (state: RootState) => state.planning.notesDialogOpen;
export const selectNotesDialogData = (state: RootState) => state.planning.notesDialogData;
export const selectNotesModalOpen = (state: RootState) => state.planning.notesModalOpen;
export const selectNotesModalData = (state: RootState) => state.planning.notesModalData;
export const selectNotes = (state: RootState) => state.planning.coordinatorNotes;

export const {
  setSelectedYear,
  setPlanningRows,
  setSelectedMasterClass,
  setSelectedClass,
  setSelectedSubClass,
  setSelectedDistrict,
  setSelectedCollectiveSubLevel,
  setSelectedSubLevelDistrict,
  setSelectedOtherClassification,
  setStartYear,
  setProjects,
  setGroupsExpanded,
  setPlanningMode,
  resetSelections,
  setForcedToFrame,
  setIsPlanningLoading,
  setNotesDialogOpen,
  setNotesDialogData,
  setNotesModalOpen,
  setNotesModalData,
} = planningSlice.actions;

export default planningSlice.reducer;
