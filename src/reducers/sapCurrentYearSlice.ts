import { IGroupSapCost, IProjectSapCost, ISapCost } from '@/interfaces/sapCostsInterfaces';
import { getSapCurrentYear } from '@/services/sapCurrentYearServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

interface ISapCostsState {
  projects: Record<string, IProjectSapCost>;
  groups: Record<string, IGroupSapCost>;
  error: unknown;
}

const initialState: ISapCostsState = {
  projects: {},
  groups: {},
  error: null,
};

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

export const sapCurrentYearSlice = createSlice({
  name: 'sapCurrentYear',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GROUP GET ALL
    builder.addCase(getSapCurrentYearThunk.fulfilled, (state, action: PayloadAction<Array<ISapCost>>) => {
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
    builder.addCase(getSapCurrentYearThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const getGroupSapCurrentYear = (state: RootState) => state.sapCurrentYear.groups;
export const getProjectSapCurrentYear = (state: RootState) => state.sapCurrentYear.projects;

export default sapCurrentYearSlice.reducer;
