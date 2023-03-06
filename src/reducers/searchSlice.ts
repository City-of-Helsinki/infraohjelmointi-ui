import { IError } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { ISearchResults } from '@/interfaces/searchInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

interface ISearchState {
  open: boolean;
  form: ISearchForm;
  submittedForm: ISearchForm;
  searchResults: ISearchResults;
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
    clearSearchState(state) {
      return {
        ...state,
        form: initialSearchForm,
        submittedForm: initialSearchForm,
        searchResults: initialSearchResults,
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

export const { toggleSearch, setSearchForm, clearSearchState, setSubmittedSearchForm } =
  searchSlice.actions;

export default searchSlice.reducer;
