import { IError } from '@/interfaces/common';
import { ISearchForm } from '@/interfaces/formInterfaces';
import { ISearchResult } from '@/interfaces/searchInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ISearchState {
  open: boolean;
  form: ISearchForm;
  searchResults: ISearchResult | null;
  error: IError | null | unknown;
}

const initialState: ISearchState = {
  open: false,
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

export const { toggleSearch, setSearchForm } = searchSlice.actions;

export default searchSlice.reducer;
