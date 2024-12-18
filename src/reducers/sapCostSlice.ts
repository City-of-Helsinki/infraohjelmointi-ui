import { IGroupSapCost, IProjectSapCost, ISapCost } from '@/interfaces/sapCostsInterfaces';
import { getSapCosts, getSapCurrentYear } from '@/services/sapCostsServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

interface ISapCostsState {
  projects: Record<string, IProjectSapCost>;
  currentSap: Record<string, IProjectSapCost>;
  groups: Record<string, IGroupSapCost>;
  currentSapGroups: Record<string, IGroupSapCost>;
  error: unknown;
}

const initialState: ISapCostsState = {
  projects: {},
  currentSap: {},
  groups: {},
  currentSapGroups: {},
  error: null,
};

export const getSapCostsThunk = createAsyncThunk(
  'sapCosts/getAll',
  async (year: number, thunkAPI) => {
    try {
      return await getSapCosts(year);
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const getSapCurrentYearThunk = createAsyncThunk(
  'sapCurrentYear/getAll',
  async (year: number, thunkAPI) => {
    try {
      return await getSapCurrentYear(year);
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const sapCostsSlice = createSlice({
  name: 'sapCosts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GROUP GET ALL SAP VALUES
    builder.addCase(getSapCostsThunk.fulfilled, (state, action: PayloadAction<Array<ISapCost>>) => {
      return {
        ...state,
        projects: _.keyBy(
          action.payload
            .filter((sapCost) => sapCost.project_id != null)
            .map((sapCost) => ({
              id: sapCost.project_id,
              sap_id: sapCost.id,
              project_task_costs: sapCost.project_task_costs,
              project_task_commitments: sapCost.project_task_commitments,
              production_task_costs: sapCost.production_task_costs,
              production_task_commitments: sapCost.production_task_commitments,
            })),
          'id',
        ),
        groups: _.keyBy(
          action.payload
            .filter((sapCost) => sapCost.project_id == null)
            .map((sapCost) => ({
              id: sapCost.project_group_id,
              sap_id: sapCost.id,
              group_combined_commitments: sapCost.group_combined_commitments,
              group_combined_costs: sapCost.group_combined_costs,
            })),
          'id',
        ),
      };
    });
    builder.addCase(getSapCostsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });

    // GET CURRENT YEAR SAP VALUES
    builder.addCase(getSapCurrentYearThunk.fulfilled, (state, action: PayloadAction<Array<ISapCost>>) => {
      return {
        ...state,
        currentSap: _.keyBy(
          action.payload
            .filter((sapCost) => sapCost.project_id != null)
            .map((sapCost) => ({
              id: sapCost.project_id,
              sap_id: sapCost.id,
              project_task_costs: sapCost.project_task_costs,
              project_task_commitments: sapCost.project_task_commitments,
              production_task_costs: sapCost.production_task_costs,
              production_task_commitments: sapCost.production_task_commitments,
            })),
          'id',
        ),
        currentSapGroups: _.keyBy(
          action.payload
            .filter((sapCost) => sapCost.project_id == null)
            .map((sapCost) => ({
              id: sapCost.project_group_id,
              sap_id: sapCost.id,
              group_combined_commitments: sapCost.group_combined_commitments,
              group_combined_costs: sapCost.group_combined_costs,
            })),
          'id',
        ),
      };
    });
    builder.addCase(getSapCurrentYearThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const getGroupSapCosts = (state: RootState) => state.sapCosts.groups;
export const getProjectSapCosts = (state: RootState) => state.sapCosts.projects;
export const getGroupSapCurrentYear = (state: RootState) => state.sapCurrentYear.currentSapGroups;
export const getProjectSapCurrentYear = (state: RootState) => state.sapCurrentYear.currentSap;

export default sapCostsSlice.reducer;
