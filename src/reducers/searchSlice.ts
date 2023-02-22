import { IError } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { ISearchResult } from '@/interfaces/searchInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

interface ISearchState {
  open: boolean;
  form: ISearchForm;
  submittedForm: ISearchForm;
  searchResult: ISearchResult | null;
  error: IError | null | unknown;
}

export const initialSearchForm = {
  freeSearchParams: {},
  masterClass: [],
  classes: [],
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
  searchResult: null,
  error: null,
};

export const getSearchResultThunk = createAsyncThunk(
  'search/getSearchResult',
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
    clearSearchForm(state) {
      return { ...state, form: initialSearchForm, submittedForm: initialSearchForm };
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
      getSearchResultThunk.fulfilled,
      (state, action: PayloadAction<ISearchResult>) => {
        return { ...state, searchResult: action.payload };
      },
    );
    builder.addCase(
      getSearchResultThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export const selectOpen = (state: RootState) => state.search.open;
export const selectSearchForm = (state: RootState) => state.search.form;
export const selectSearchResult = (state: RootState) => state.search.searchResult;
export const selectSubmittedSearchForm = (state: RootState) => state.search.submittedForm;

export const { toggleSearch, setSearchForm, clearSearchForm, setSubmittedSearchForm } =
  searchSlice.actions;

export default searchSlice.reducer;
