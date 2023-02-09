import { ISearchForm } from '@/interfaces/formInterfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ISearchState {
  open: boolean;
  form: ISearchForm;
}

/**
 * TODO:
 * The search options should be stored, since the user is supposed to be able to return to the
 * search dialog/form and continue adding or removing the current criterias
 */
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
};

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
});

export const { toggleSearch, setSearchForm } = searchSlice.actions;

export default searchSlice.reducer;
