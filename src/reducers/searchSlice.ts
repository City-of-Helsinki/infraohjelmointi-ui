import { IError, FreeSearchFormObject } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { ISearchResult } from '@/interfaces/searchInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import produce from 'immer';
import { RootState } from '@/store';

interface ISearchState {
  open: boolean;
  form: ISearchForm;
  freeSearchParams: FreeSearchFormObject | null;
  searchResults: ISearchResult | null;
  error: IError | null | unknown;
}

export const initialState: ISearchState = {
  open: false,
  freeSearchParams: null,
  form: {
    masterClass: [],
    class: [],
    subClass: [],
    programmedYes: false,
    programmedNo: false,
    personPlanning: '',
    programmedYearMin: '',
    programmedYearMax: '',
    phase: { value: '', label: '' },
    responsiblePerson: { value: '', label: '' },
    district: [],
    division: [],
    subDivision: [],
    category: { value: '', label: '' },
  },
  searchResults: null,
  error: null,
};

export const getSearchResultsThunk = createAsyncThunk(
  'search/getSearchResults',
  async (params: string, thunkAPI) => {
    return await getProjectsWithParams(params)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    toggleSearch(state) {
      return { ...state, open: !state.open };
    },
    setSearchForm(state, action: PayloadAction<ISearchForm>) {
      return { ...state, form: { ...state.form, ...action.payload } };
    },
    setFreeSearchParams(state, action: PayloadAction<FreeSearchFormObject>) {
      return { ...state, freeSearchParams: { ...state.freeSearchParams, ...action.payload } };
    },
    removeFreeSearchParam(state, action: PayloadAction<string>) {
      produce(state, () => {
        state.freeSearchParams && delete state.freeSearchParams[action.payload];
      });
    },
  },
  extraReducers: (builder) => {
    // GET SEARCH RESULTS
    builder.addCase(
      getSearchResultsThunk.fulfilled,
      (state, action: PayloadAction<ISearchResult>) => {
        return { ...state, searchResults: action.payload };
      },
    );
    builder.addCase(
      getSearchResultsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const selectOpen = (state: RootState) => state.search.open;
export const selectFreeSearchParams = (state: RootState) => state.search.freeSearchParams;
export const selectSearchForm = (state: RootState) => state.search.form;
export const selectSearchResults = (state: RootState) => state.search.searchResults;

export const { toggleSearch, setSearchForm, setFreeSearchParams, removeFreeSearchParam } =
  searchSlice.actions;

export default searchSlice.reducer;
