import React, { ReactElement, ReactNode } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { setupStore } from '../store';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import type { AppStore, RootState } from '../store';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

interface IWrapperProps {
  children: ReactNode;
}

export const ReduxProvider =
  (store: Store) =>
  ({ children }: IWrapperProps): ReactElement =>
    (<Provider store={store}>{children}</Provider>) as unknown as ReactElement;

export interface CustomRenderResult extends RenderResult {
  user: UserEvent;
  store: AppStore;
}

/**
 * Wrapper function for testing components that the redux provider and the react-router
 *
 * @param ui a ReactElement, to be wrapped within the Provider
 * @param store an optional custom store if needed for testing
 * @param route  an optional custom route if needed for testing
 * @returns
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
  { route = '/' } = {},
): CustomRenderResult => {
  window.history.pushState({}, 'Test page', route);

  const WrappedWithReduxProvider = ReduxProvider(store)({ children: ui });

  const renderResult = render(WrappedWithReduxProvider, {
    wrapper: BrowserRouter,
    ...renderOptions,
  });

  return {
    store,
    user: userEvent.setup(),
    ...renderResult,
  };
};
