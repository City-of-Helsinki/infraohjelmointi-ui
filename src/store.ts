import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import projectReducer from '@/reducers/projectSlice';
import authReducer from '@/reducers/authSlice';
import notificationReducer from '@/reducers/notificationSlice';
import loaderReducer from './reducers/loaderSlice';
import listsReducer from './reducers/listsSlice';
import noteReducer from './reducers/noteSlice';
import classReducer from './reducers/classSlice';
import locationReducer from './reducers/locationSlice';
import hashTagReducer from './reducers/hashTagsSlice';
import searchReducer from './reducers/searchSlice';
import groupReducer from './reducers/groupSlice';

// Add slices (reducers) here, this is imported into the test-utils for providing the redux state into tests
export const storeItems = {
  project: projectReducer,
  auth: authReducer,
  notifications: notificationReducer,
  loader: loaderReducer,
  lists: listsReducer,
  note: noteReducer,
  class: classReducer,
  location: locationReducer,
  hashTags: hashTagReducer,
  search: searchReducer,
  group: groupReducer,
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
