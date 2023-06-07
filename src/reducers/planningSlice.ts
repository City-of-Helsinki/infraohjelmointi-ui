import { IClass } from '@/interfaces/classInterfaces';
import { IPlanningRow, IPlanningRowSelections } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IPlanningState {
  selectedYear: number | null;
  startYear: number | null;
  selections: IPlanningRowSelections;
  projects: Array<IProject>;
  rows: Array<IPlanningRow>;
}

const initialState: IPlanningState = {
  selectedYear: null,
  startYear: null,
  selections: {
    selectedMasterClass: null,
    selectedClass: null,
    selectedSubClass: null,
    selectedDistrict: null,
  },
  projects: [],
  rows: [],
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
    setPlanningRows(state, action: PayloadAction<Array<IPlanningRow>>) {
      return { ...state, rows: action.payload };
    },
    setProjects(state, action: PayloadAction<Array<IProject>>) {
      return { ...state, projects: action.payload };
    },
  },
});

export const selectSelectedYear = (state: RootState) => state.planning.selectedYear;
export const selectStartYear = (state: RootState) => state.planning.startYear;
export const selectSelections = (state: RootState) => state.planning.selections;
export const selectPlanningRows = (state: RootState) => state.planning.rows;
export const selectProjects = (state: RootState) => state.planning.projects;

export const {
  setSelectedYear,
  setPlanningRows,
  setSelectedMasterClass,
  setSelectedClass,
  setSelectedSubClass,
  setSelectedDistrict,
  setStartYear,
  setProjects,
} = planningSlice.actions;

export default planningSlice.reducer;
