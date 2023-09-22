import { IClass } from '@/interfaces/classInterfaces';
import { getCoordinationClasses, getPlanningClasses } from '@/services/classServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IClassHierarchy {
  allClasses: Array<IClass>;
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  year: number;
}

export interface ICoordinatorClassHierarchy extends IClassHierarchy {
  collectiveSubLevels: Array<IClass>;
  otherClassifications: Array<IClass>;
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

const initialClasses = {
  allClasses: [],
  masterClasses: [],
  classes: [],
  subClasses: [],
  year: new Date().getFullYear(),
};

const initialCoordinationClasses = {
  ...initialClasses,
  collectiveSubLevels: [],
  otherClassifications: [],
  otherClassificationSubLevels: [],
};

const initialState: IClassState = {
  planning: initialClasses,
  coordination: initialCoordinationClasses,
  forcedToFrame: initialCoordinationClasses,
  error: null,
};

export const getPlanningClassesThunk = createAsyncThunk(
  'class/getAllPlanning',
  async (year: number, thunkAPI) => {
    try {
      const classes = await getPlanningClasses(year);
      return classes;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const getCoordinationClassesThunk = createAsyncThunk(
  'class/getAllCoordination',
  async (year: number, thunkAPI) => {
    try {
      const classes = await getCoordinationClasses({ forcedToFrame: false, year });
      return classes;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const getForcedToFrameClassesThunk = createAsyncThunk(
  'class/getAllForcedToFrame',
  async (year: number, thunkAPI) => {
    try {
      const classes = await getCoordinationClasses({ forcedToFrame: true, year });
      return classes;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

const getClassesForParents = (allClasses: Array<IClass>, parents: Array<IClass>) =>
  parent ? allClasses?.filter((ac) => parents.findIndex((p) => p.id === ac.parent) !== -1) : [];

const separateClassesIntoHierarchy = (allClasses: Array<IClass>, forCoordinator: boolean) => {
  const getClasses = (parents: Array<IClass>) => getClassesForParents(allClasses, parents);

  const masterClasses = allClasses?.filter((ac) => !ac.parent);
  const classes = getClasses(masterClasses);
  const subClasses = getClasses(classes);

  if (!forCoordinator) {
    return {
      allClasses,
      masterClasses,
      classes,
      subClasses,
      year: classes[0]?.finances?.year,
    };
  }

  const collectiveSubLevels = getClasses(subClasses);
  const otherClassifications = getClasses(collectiveSubLevels);
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
    updateCollectiveSubLevel(state, action: PayloadAction<IClass | null>) {
      const data = action.payload;

      if (data) {
        const collectiveSubLevels = [...state.coordination.collectiveSubLevels].map((csl) =>
          csl.id === data.id ? data : csl,
        );
        return {
          ...state,
          coordination: { ...state.coordination, collectiveSubLevels },
        };
      }
    },
    updateOtherClassification(state, action: PayloadAction<IClass | null>) {
      const data = action.payload;

      if (data) {
        const otherClassifications = [...state.coordination.otherClassifications].map((oc) =>
          oc.id === data.id ? data : oc,
        );
        return {
          ...state,
          coordination: { ...state.coordination, otherClassifications },
        };
      }
    },
    updateOtherClassificationSubLevel(state, action: PayloadAction<IClass | null>) {
      const data = action.payload;

      if (data) {
        const otherClassificationSubLevels = [
          ...state.coordination.otherClassificationSubLevels,
        ].map((ocsl) => (ocsl.id === data.id ? data : ocsl));
        return {
          ...state,
          coordination: {
            ...state.coordination,
            otherClassificationSubLevels,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    // GET ALL PLANNING
    builder.addCase(
      getPlanningClassesThunk.fulfilled,
      (state, action: PayloadAction<Array<IClass>>) => {
        return {
          ...state,
          planning: separateClassesIntoHierarchy(action.payload, false),
        };
      },
    );
    builder.addCase(getPlanningClassesThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // GET ALL COORDINATION
    builder.addCase(
      getCoordinationClassesThunk.fulfilled,
      (state, action: PayloadAction<Array<IClass>>) => {
        return {
          ...state,
          coordination: separateClassesIntoHierarchy(
            action.payload,
            true,
          ) as ICoordinatorClassHierarchy,
        };
      },
    );
    builder.addCase(
      getCoordinationClassesThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET ALL FORCED TO FRAME
    builder.addCase(
      getForcedToFrameClassesThunk.fulfilled,
      (state, action: PayloadAction<Array<IClass>>) => {
        return {
          ...state,
          forcedToFrame: separateClassesIntoHierarchy(
            action.payload,
            true,
          ) as ICoordinatorClassHierarchy,
        };
      },
    );
    builder.addCase(
      getForcedToFrameClassesThunk.rejected,
      (state, action: PayloadAction<unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const {
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
export const selectBatchedPlanningClasses = (state: RootState) => state.class.planning;
export const selectBatchedCoordinationClasses = (state: RootState) => state.class.coordination;
export const selectBatchedForcedToFrameClasses = (state: RootState) => state.class.forcedToFrame;

export default classSlice.reducer;
