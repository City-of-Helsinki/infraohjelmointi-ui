import { createSlice } from '@reduxjs/toolkit';

interface ISearchState {
  open: boolean;
}

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
