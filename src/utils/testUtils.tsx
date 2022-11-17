import React, { ReactElement, ReactNode, ComponentType } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { storeItems } from '../store';

import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import type { AppStore, RootState } from '../store';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

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
  ({ children }: IWrapperProps): ReactElement => {
    jest.mock('react-i18next', () => ({
      useTranslation: () => {
        return {
          t: (str: string) => str,
          i18n: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            changeLanguage: () => new Promise(() => {}),
          },
        };
      },
    }));
    return (<Provider store={store}>{children}</Provider>) as unknown as ReactElement;
  };

/**
 * Wrapper function for testing components that the redux provider and the react-router
 *
 * @param ui a ReactElement, to be wrapped within the Provider
 * @param route  an optional custom route if needed for testing
 * @param store an optional custom store if needed for testing
 * @param param1
 * @returns
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  { route = '/' } = {},
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({ reducer: storeItems, preloadedState }),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) => {
  window.history.pushState({}, 'Test page', route);
  const wrappedWithRedux = ReduxProvider(store)({ children: ui });
  return {
    user: userEvent.setup(),
    ...render(wrappedWithRedux, { wrapper: BrowserRouter, ...renderOptions }),
  };
};
