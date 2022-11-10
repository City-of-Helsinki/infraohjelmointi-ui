import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import testReducer from './reducers/testSlice';

// Add slices (reducers) here, this is imported into the test-utils for providing the redux state into tests
export const storeItems = {
  test: testReducer,
};

const rootReducer = combineReducers(storeItems);

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
