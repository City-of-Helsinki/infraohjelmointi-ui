import { IError } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { ISearchRequest, ISearchResults, SearchLimit } from '@/interfaces/searchInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

interface ISearchState {
  open: boolean;
  form: ISearchForm;
  submittedForm: ISearchForm;
  searchResults: ISearchResults;
  lastSearchParams: string;
  searchLimit: SearchLimit;
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
  personPlanning: '',
  programmedYearMin: '',
  programmedYearMax: '',
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
  error: null,
};

export const getSearchResultsThunk = createAsyncThunk(
  'search/getSearchResults',
  async (req: ISearchRequest, thunkAPI) => {
    const searchLimit = (thunkAPI.getState() as RootState).search.searchLimit;
    const lastSearchParams = (thunkAPI.getState() as RootState).search.lastSearchParams;
    req.limit = searchLimit;
    req.params = req.params || lastSearchParams;
    return await getProjectsWithParams(req)
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
    setLastSearchParams(state, action: PayloadAction<string>) {
      return { ...state, lastSearchParams: action.payload };
    },
    setSearchLimit(state, action: PayloadAction<SearchLimit>) {
      return { ...state, searchLimit: action.payload };
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

export const {
  toggleSearch,
  setSearchForm,
  clearSearchState,
  setSubmittedSearchForm,
  setLastSearchParams,
  setSearchLimit,
} = searchSlice.actions;

export default searchSlice.reducer;
