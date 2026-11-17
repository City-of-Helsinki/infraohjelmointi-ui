import { classApi } from '@/api/classApi';
import { IClass } from '@/interfaces/classInterfaces';
import { RootState } from '@/store';
import { getErrorFromRejectedAction } from '@/utils/reduxErrorUtils';
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';

export interface IClassHierarchy {
  allClasses: Array<IClass>;
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  otherClassifications: Array<IClass>;
  year: number;
}

export interface ICoordinatorClassHierarchy extends IClassHierarchy {
  collectiveSubLevels: Array<IClass>;
  otherClassificationSubLevels: Array<IClass>;
}

interface IClassState {
  planning: IClassHierarchy;
  coordination: ICoordinatorClassHierarchy;
  forcedToFrame: ICoordinatorClassHierarchy;
  error: unknown;
}

interface IClassUpdatePayload {
  data: IClass | null;
  type: 'coordination' | 'planning' | 'forcedToFrame';
}

interface ICoordinatorClassUpdatePayload {
  data: IClass | null;
  type: 'coordination' | 'forcedToFrame';
}

const initialClasses = {
  allClasses: [],
  masterClasses: [],
  classes: [],
  subClasses: [],
  otherClassifications: [],
  year: new Date().getFullYear(),
};

const initialCoordinationClasses = {
  ...initialClasses,
  collectiveSubLevels: [],
  otherClassificationSubLevels: [],
};

const initialState: IClassState = {
  planning: initialClasses,
  coordination: initialCoordinationClasses,
  forcedToFrame: initialCoordinationClasses,
  error: null,
};

const getClassesForParents = (allClasses: Array<IClass>, parents: Array<IClass>) =>
  parent ? allClasses?.filter((ac) => parents.findIndex((p) => p.id === ac.parent) !== -1) : [];

export const separateClassesIntoHierarchy = (
  allClasses: Array<IClass>,
  forCoordinator: boolean,
) => {
  const getClasses = (parents: Array<IClass>) => getClassesForParents(allClasses, parents);

  const masterClasses = allClasses?.filter((ac) => !ac.parent);
  const classes = getClasses(masterClasses);
  const subClasses = getClasses(classes);
  const collectiveSubLevels = getClasses(subClasses);
  const otherClassifications = getClasses(collectiveSubLevels);

  if (!forCoordinator) {
    // other classifications are on the same level as districts in planning view so we need to fetch the data differently for plannig view
    const otherClassifications = getClasses(subClasses);
    return {
      allClasses,
      masterClasses,
      classes,
      subClasses,
      otherClassifications,
      year: classes[0]?.finances?.year,
    };
  }

  const otherClassificationSubLevels = getClasses(otherClassifications);

  return {
    allClasses,
    masterClasses,
    classes,
    subClasses,
    collectiveSubLevels,
    otherClassifications,
    otherClassificationSubLevels,
    year: classes[0]?.finances?.year,
  };
};

export const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    setPlanningClasses(state, action: PayloadAction<Array<IClass>>) {
      return { ...state, planning: separateClassesIntoHierarchy(action.payload, false) };
    },
    setCoordinationClasses(state, action: PayloadAction<Array<IClass>>) {
      return {
        ...state,
        coordination: separateClassesIntoHierarchy(
          action.payload,
          true,
        ) as ICoordinatorClassHierarchy,
      };
    },
    setForcedToFrameClasses(state, action: PayloadAction<Array<IClass>>) {
      return {
        ...state,
        forcedToFrame: separateClassesIntoHierarchy(
          action.payload,
          true,
        ) as ICoordinatorClassHierarchy,
      };
    },
    updateMasterClass(state, action: PayloadAction<IClassUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const masterClasses = [...state[type].masterClasses].map((mc) =>
          mc.id === data.id ? data : mc,
        );
        return { ...state, [type]: { ...state[type], masterClasses } };
      }
    },
    updateClass(state, action: PayloadAction<IClassUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const classes = [...state[type].classes].map((c) => (c.id === data.id ? data : c));
        return { ...state, [type]: { ...state[type], classes } };
      }
    },
    updateSubClass(state, action: PayloadAction<IClassUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const subClasses = [...state[type].subClasses].map((sc) => (sc.id === data.id ? data : sc));
        return { ...state, [type]: { ...state[type], subClasses } };
      }
    },
    updateCollectiveSubLevel(state, action: PayloadAction<ICoordinatorClassUpdatePayload>) {
      const { data, type } = action.payload;

      if (data) {
        const collectiveSubLevels = [...state[type].collectiveSubLevels].map((csl) =>
          csl.id === data.id ? data : csl,
        );
        return {
          ...state,
          [type]: { ...state[type], collectiveSubLevels },
        };
      }
    },
    updateOtherClassification(state, action: PayloadAction<ICoordinatorClassUpdatePayload>) {
      const { data, type } = action.payload;
      if (data) {
        const otherClassifications = [...state[type].otherClassifications].map((oc) =>
          oc.id === data.id ? data : oc,
        );
        return {
          ...state,
          [type]: { ...state[type], otherClassifications },
        };
      }
    },
    updateOtherClassificationSubLevel(
      state,
      action: PayloadAction<ICoordinatorClassUpdatePayload>,
    ) {
      const { data, type } = action.payload;

      if (data) {
        const otherClassificationSubLevels = [...state[type].otherClassificationSubLevels].map(
          (ocsl) => (ocsl.id === data.id ? data : ocsl),
        );
        return {
          ...state,
          [type]: {
            ...state[type],
            otherClassificationSubLevels,
          },
        };
      }
    },
  },
  // Fulfilled results are not synced here: ReportRow fetches other years via the same endpoints.
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        classApi.endpoints.getPlanningClasses.matchRejected,
        classApi.endpoints.getCoordinationClasses.matchRejected,
      ),
      (state, action) => {
        state.error = getErrorFromRejectedAction(action);
      },
    );
  },
});

export const {
  setPlanningClasses,
  setCoordinationClasses,
  setForcedToFrameClasses,
  updateMasterClass,
  updateClass,
  updateSubClass,
  updateCollectiveSubLevel,
  updateOtherClassification,
  updateOtherClassificationSubLevel,
} = classSlice.actions;

export const selectAllPlanningClasses = (state: RootState) => state.class.planning.allClasses;
export const selectPlanningMasterClasses = (state: RootState) => state.class.planning.masterClasses;
export const selectPlanningClasses = (state: RootState) => state.class.planning.classes;
export const selectPlanningSubClasses = (state: RootState) => state.class.planning.subClasses;
export const selectPlanningOtherClassifications = (state: RootState) =>
  state.class.planning.otherClassifications;
export const selectBatchedPlanningClasses = (state: RootState) => state.class.planning;
export const selectBatchedCoordinationClasses = (state: RootState) => state.class.coordination;
export const selectBatchedForcedToFrameClasses = (state: RootState) => state.class.forcedToFrame;

export default classSlice.reducer;
