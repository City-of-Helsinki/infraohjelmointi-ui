import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILoadingState {
  isLoading: boolean;
  text: string | null;
}

const initialState: ILoadingState = {
  isLoading: false,
  text: null,
};

export const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<string>) {
      return { isLoading: true, text: action.payload };
    },
    clearLoading() {
      return initialState;
    },
  },
});

export const { setLoading, clearLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
