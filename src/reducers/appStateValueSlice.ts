import { IError } from "@/interfaces/common"
import { getAllAppStateValues } from "@/services/appStateValueServices"
import { RootState } from "@/store"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface IForcedToFrameState {
    id: string,
    isOpen: boolean,
    lastModified: string
}

export interface IForcedToFrameDataUpdated {
    id: string,
    hasBeenMoved: boolean,
    lastModified: string
}
 
export interface IAppStateValues {
    forcedToFrameState: IForcedToFrameState
    forcedToFrameDataUpdated: IForcedToFrameDataUpdated
}

const initialState: IAppStateValues = {
    forcedToFrameState: {
        id: "",
        isOpen: false,
        lastModified: "",
    },
    forcedToFrameDataUpdated: {
        id: "",
        hasBeenMoved: false,
        lastModified: ""
    }
}

const getForcedToFrameState = (appStateValues: Array<any>): IForcedToFrameState => {
    for (const value of appStateValues) {
        if (value.name === "forcedToFrameStatus") {
            return {
                id: value.id,
                isOpen: value.value,
                lastModified: value.updatedDate
            }
        }
    }
    return initialState.forcedToFrameState;
}

const getForcedToFrameDataUpdated = (appStateValues: Array<any>): IForcedToFrameDataUpdated => {
    for (const value of appStateValues) {
        if (value.name === "forcedToFrameDataUpdated") {
            return {
                id: value.id,
                hasBeenMoved: value.value,
                lastModified: value.updatedDate
            }
        }
    }
    return initialState.forcedToFrameDataUpdated;
}

export const getAppStateValuesThunk = createAsyncThunk("appStateValues/get", async (_, thunkAPI) => {
    try {
        const appStateValues = await getAllAppStateValues();
        return {
            forcedToFrameState: getForcedToFrameState(appStateValues),
            forcedToFrameDataUpdated: getForcedToFrameDataUpdated(appStateValues),
        }
    } catch (err) {
        return thunkAPI.rejectWithValue(err);
    }
});

export const appStateValueSlice = createSlice({
    name: 'appStateValues',
    initialState,
    reducers: {
        setForcedToFrameState(state, action: PayloadAction<IForcedToFrameState>) {
            return { ...state, forcedToFrameState: action.payload };
          },
        setForcedToFrameValuesUpdated(state, action: PayloadAction<IForcedToFrameDataUpdated>) {
            return { ...state, forcedToFrameDataUpdated: action.payload};
        },
    },
    extraReducers: (builder) => {
        // GET all app state values
        builder.addCase(
          getAppStateValuesThunk.fulfilled,
          (state, action: PayloadAction<Omit<IAppStateValues, 'error'>>) => {
            return { ...state, ...action.payload };
          },
        );
        builder.addCase(getAppStateValuesThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
          return { ...state, error: action.payload };
        });
      },
});

export const selectForcedToFrameState = (state: RootState) => state.appStateValues.forcedToFrameState;
export const selectForcedToFrameDataUpdtaed = (state: RootState) => state.appStateValues.forcedToFrameDataUpdated;

export const {
    setForcedToFrameState,
    setForcedToFrameValuesUpdated,
} = appStateValueSlice.actions;

export default appStateValueSlice.reducer;