import { IError } from "@/interfaces/common"
import { getAllAppStateValues } from "@/services/appStateValueServices"
import { RootState } from "@/store"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface IForcedToFrameState {
    id: string,
    isOpen: boolean,
    lastModified: string
}
 
export interface IAppStateValues {
    forcedToFrameState: IForcedToFrameState
    coordinationDataMoved: {
        id: string,
        hasBeenMoved: boolean,
        lastModified: string
    }
}

const initialState: IAppStateValues = {
    forcedToFrameState: {
        id: "",
        isOpen: false,
        lastModified: "",
    },
    coordinationDataMoved: {
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

export const getAppStateValuesThunk = createAsyncThunk("appStateValues/get", async (_, thunkAPI) => {
    try {
        const appStateValues = await getAllAppStateValues();
        return {
            forcedToFrameState: getForcedToFrameState(appStateValues),
            coordinationDataMoved: appStateValues
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
export const selectCoordinationDataMoved = (state: RootState) => state.appStateValues.coordinationDataMoved;

export const {
    setForcedToFrameState,
} = appStateValueSlice.actions;

export default appStateValueSlice.reducer;