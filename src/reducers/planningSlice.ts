import { IClass } from '@/interfaces/classInterfaces';
import {
  IPlanningRow,
  IPlanningRowSelections,
  PlanningMode,
} from '@/interfaces/planningInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IPlanningState {
  selectedYear: number | null;
  startYear: number | null;
  groupsExpanded: boolean;
  searchedProjectId: string | null;
  selections: IPlanningRowSelections;
  projects: Array<IProject>;
  rows: Array<IPlanningRow>;
  mode: PlanningMode;
  forcedToFrame: boolean;
}

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
};

export const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    setSelectedYear(state, action: PayloadAction<number | null>) {
      return { ...state, selectedYear: action.payload };
    },
    setStartYear(state, action: PayloadAction<number | null>) {
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
  },
});

export const selectSelectedYear = (state: RootState) => state.planning.selectedYear;
export const selectStartYear = (state: RootState) => state.planning.startYear;
export const selectSelections = (state: RootState) => state.planning.selections;
export const selectPlanningRows = (state: RootState) => state.planning.rows;
export const selectProjects = (state: RootState) => state.planning.projects;
export const selectGroupsExpanded = (state: RootState) => state.planning.groupsExpanded;
export const selectPlanningMode = (state: RootState) => state.planning.mode;
export const selectForcedToFrame = (state: RootState) => state.planning.forcedToFrame;

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
} = planningSlice.actions;

export default planningSlice.reducer;
