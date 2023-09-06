import React, { ReactElement } from 'react';
import { render, RenderResult, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '../store';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import type { AppStore, RootState } from '../store';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes } from 'react-router-dom';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import EventSourceMock from '@/mocks/mockEventSource';
import { IProject } from '@/interfaces/projectInterfaces';
import { AuthProvider } from 'react-oidc-context';

const { REACT_APP_AUTHORITY, REACT_APP_CLIENT_ID, REACT_APP_REDIRECT_URI } = process.env;

const oidcConfig = {
  authority: REACT_APP_AUTHORITY ?? '',
  client_id: REACT_APP_CLIENT_ID ?? '',
  redirect_uri: REACT_APP_REDIRECT_URI ?? '',
  scope: 'openid profile',
};

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

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

  const Wrapper = ({ children }: { children: ReactElement }) => {
    return <Provider store={store}>{children}</Provider>;
  };

  const renderResult = render(
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <Routes>{ui}</Routes>
      </BrowserRouter>
    </AuthProvider>,
    {
      wrapper: Wrapper,
      ...renderOptions,
    },
  );

  return {
    store,
    user: userEvent.setup(),
    ...renderResult,
  };
};

export const sendProjectUpdateEvent = async (data: IProject) => {
  await waitFor(() =>
    new EventSourceMock().emitMessage({
      id: '',
      type: 'project-update',
      data: JSON.stringify({
        project: data,
      }),
    }),
  );
};

export const sendFinanceUpdateEvent = async (data: object) => {
  await waitFor(() =>
    new EventSourceMock().emitMessage({
      id: '',
      type: 'finance-update',
      data: JSON.stringify({
        ...data,
      }),
    }),
  );
};
