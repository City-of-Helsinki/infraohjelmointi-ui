import { IError } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import {
  ISearchRequest,
  ISearchResults,
  SearchLimit,
  SearchOrder,
} from '@/interfaces/searchInterfaces';
import { getSearchResults } from '@/services/projectServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

interface ISearchState {
  open: boolean;
  form: ISearchForm;
  submittedForm: ISearchForm;
  searchResults: ISearchResults;
  lastSearchParams: string;
  searchLimit: SearchLimit;
  searchOrder: SearchOrder;
  error: IError | null | unknown;
}

const initialSearchResults = {
  next: null,
  previous: null,
  count: 0,
  results: [],
};

export const initialSearchForm = {
  freeSearchParams: {},
  masterClass: [],
  class: [],
  subClass: [],
  programmedYes: false,
  programmedNo: false,
  hkrIds: [],
  personPlanning: { value: '', label: '' },
  personConstruction: { value: '', label: '' },
  programmedYearMin: { value: '', label: '' },
  programmedYearMax: { value: '', label: '' },
  phase: { value: '', label: '' },
  responsiblePerson: { value: '', label: '' },
  district: [],
  division: [],
  subDivision: [],
  category: { value: '', label: '' },
};

const initialState: ISearchState = {
  open: false,
  form: initialSearchForm,
  submittedForm: initialSearchForm,
  searchResults: initialSearchResults,
  lastSearchParams: '',
  searchLimit: '10',
  searchOrder: 'new',
  error: null,
};

export const getSearchResultsThunk = createAsyncThunk(
  'search/getSearchResults',
  async (req: ISearchRequest, thunkAPI) => {
    req.limit = (thunkAPI.getState() as RootState).search.searchLimit;
    req.params = req.params || (thunkAPI.getState() as RootState).search.lastSearchParams;
    req.order = (thunkAPI.getState() as RootState).search.searchOrder;

    try {
      const searchResults = await getSearchResults(req);
      return searchResults;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const searchSlice = createSlice({
  name: 'search',
  initialState: initialState,
  reducers: {
    toggleSearch(state) {
      return { ...state, open: !state.open };
    },
    setSearchForm(state, action: PayloadAction<ISearchForm>) {
      return { ...state, form: { ...state.form, ...action.payload } };
    },
    setLastSearchParams(state, action: PayloadAction<string>) {
      return { ...state, lastSearchParams: action.payload };
    },
    setSearchLimit(state, action: PayloadAction<SearchLimit>) {
      return { ...state, searchLimit: action.payload };
    },
    setSearchOrder(state, action: PayloadAction<SearchOrder>) {
      return { ...state, searchOrder: action.payload };
    },
    clearSearchState(state) {
      return {
        ...state,
        form: initialSearchForm,
        submittedForm: initialSearchForm,
        searchResults: initialSearchResults,
        lastSearchParams: initialState.lastSearchParams,
        searchPage: 1,
      };
    },
    setSubmittedSearchForm(state, action: PayloadAction<ISearchForm>) {
      return {
        ...state,
        form: { ...state.form, ...action.payload },
        submittedForm: { ...state.form, ...action.payload },
      };
    },
  },
  extraReducers: (builder) => {
    // GET SEARCH RESULTS
    builder.addCase(
      getSearchResultsThunk.fulfilled,
      (state, action: PayloadAction<ISearchResults>) => {
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
export const selectSearchForm = (state: RootState) => state.search.form;
export const selectSearchResults = (state: RootState) => state.search.searchResults;
export const selectSubmittedSearchForm = (state: RootState) => state.search.submittedForm;
export const selectLastSearchParams = (state: RootState) => state.search.lastSearchParams;
export const selectSearchLimit = (state: RootState) => state.search.searchLimit;
export const selectSearchOrder = (state: RootState) => state.search.searchOrder;

export const {
  toggleSearch,
  setSearchForm,
  clearSearchState,
  setSubmittedSearchForm,
  setLastSearchParams,
  setSearchLimit,
  setSearchOrder,
} = searchSlice.actions;

export default searchSlice.reducer;
