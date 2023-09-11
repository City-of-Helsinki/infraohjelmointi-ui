import React from 'react';
import { render, RenderResult, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '../store';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderHookResult, RenderOptions } from '@testing-library/react';
import type { AppStore, RootState } from '../store';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes } from 'react-router-dom';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import EventSourceMock from '@/mocks/mockEventSource';
import { IProject } from '@/interfaces/projectInterfaces';
import { AuthProvider } from 'react-oidc-context';
import { UserManager } from 'oidc-client-ts';

const oidcConfig = {
  authority: 'authority',
  client_id: 'client',
  redirect_uri: 'redirect',
  scope: 'openid profile',
  userManager: new UserManager({
    authority: 'authority',
    client_id: 'client',
    redirect_uri: 'redirect',
    scope: 'openid profile',
  }) as never,
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomHookRenderResult extends RenderHookResult<any, any> {
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

  const renderResult = render(
    <BrowserRouter>
      <AuthProvider {...oidcConfig}>
        <Provider store={store}>
          <Routes>{ui}</Routes>
        </Provider>
      </AuthProvider>
    </BrowserRouter>,

    {
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
