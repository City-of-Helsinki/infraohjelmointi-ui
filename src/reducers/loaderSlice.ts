import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILoaderItem {
  id: string | null;
  text: string | null;
}

interface ILoadingState {
  isLoading: boolean;
  isProjectCardLoading: boolean;
  loaders: Array<ILoaderItem>;
}

const initialState: ILoadingState = {
  isLoading: false,
  isProjectCardLoading: false,
  loaders: [],
};

/**
 * Loader slice can store multiple loaders and will always have its isLoading state as true if there are
 * loaders in the list. This will make sure that in a chain of requests the app is in a loading state until the last async request
 * has finished, even if there are shorter completed promises in-between.
 */
export const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<ILoaderItem>) {
      const currentLoaders = [...state.loaders];
      currentLoaders.push(action.payload);
      return { ...state, loaders: currentLoaders, isLoading: currentLoaders.length > 0 };
    },
    setIsProjectCardLoading(state) {
      return { ...state, isLoading: true };
    },
    clearIsProjectCardLoading(state) {
      return { ...state, isLoading: false };
    },
    clearLoading(state, action: PayloadAction<string>) {
      const nextLoaders = state.loaders.filter((s) => s.id !== action.payload);
      return { ...state, loaders: nextLoaders, isLoading: nextLoaders.length > 0 };
    },
  },
});

export const selectIsLoading = (state: RootState) => state.loader.isLoading;
export const selectIsProjectCardLoading = (state: RootState) => state.loader.isProjectCardLoading

export const { setLoading, clearLoading, setIsProjectCardLoading, clearIsProjectCardLoading } = loaderSlice.actions;
export default loaderSlice.reducer;
