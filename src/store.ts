import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import projectReducer from '@/reducers/projectSlice';
import authReducer from '@/reducers/authSlice';
import notificationReducer from '@/reducers/notificationSlice';
import loadingSlice from './reducers/loadingSlice';
import listsSlice from './reducers/listsSlice';
import noteSlice from './reducers/noteSlice';

// Add slices (reducers) here, this is imported into the test-utils for providing the redux state into tests
export const storeItems = {
  project: projectReducer,
  auth: authReducer,
  notifications: notificationReducer,
  loading: loadingSlice,
  lists: listsSlice,
  note: noteSlice,
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
