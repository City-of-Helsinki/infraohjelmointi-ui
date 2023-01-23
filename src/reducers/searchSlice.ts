import { createSlice } from '@reduxjs/toolkit';

interface ISearchState {
  open: boolean;
}

/**
 * TODO:
 * The search options should be stored, since the user is supposed to be able to return to the
 * search dialog/form and continue adding or removing the current criterias
 */
const initialState: ISearchState = {
  open: false,
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    toggleSearch(state) {
      return { ...state, open: !state.open };
    },
  },
});

export const { toggleSearch } = searchSlice.actions;

export default searchSlice.reducer;
