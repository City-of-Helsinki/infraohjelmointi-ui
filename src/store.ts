import { combineReducers, configureStore } from '@reduxjs/toolkit';
import projectReducer from '@/reducers/projectSlice';
import authReducer from '@/reducers/authSlice';
import notificationReducer from '@/reducers/notificationSlice';
import loaderReducer from './reducers/loaderSlice';
import listsReducer from './reducers/listsSlice';
import classReducer from './reducers/classSlice';
import locationReducer from './reducers/locationSlice';
import hashTagReducer from './reducers/hashTagsSlice';
import searchReducer from './reducers/searchSlice';
import groupReducer from './reducers/groupSlice';
import eventsReducer from './reducers/eventsSlice';
import planningReducer from './reducers/planningSlice';
import sapCostReducer from './reducers/sapCostSlice';
import appStateValuesReducer from './reducers/appStateValueSlice';
import talpaReducer from './reducers/talpaSlice';
import { infraohjelmointiApi } from './api/infraohjelmointiApi';

// Add slices (reducers) here, this is imported into the test-utils for providing the redux state into tests
export const storeItems = {
  project: projectReducer,
  auth: authReducer,
  notifications: notificationReducer,
  loader: loaderReducer,
  lists: listsReducer,
  class: classReducer,
  location: locationReducer,
  hashTags: hashTagReducer,
  search: searchReducer,
  group: groupReducer,
  events: eventsReducer,
  planning: planningReducer,
  sapCosts: sapCostReducer,
  appStateValues: appStateValuesReducer,
  talpa: talpaReducer,
  [infraohjelmointiApi.reducerPath]: infraohjelmointiApi.reducer,
};

const rootReducer = combineReducers(storeItems);

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(infraohjelmointiApi.middleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
