import React, { FC, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { storeItems } from '../store';

import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import type { AppStore, RootState } from '../store';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

interface IWrapperProps {
  children: ReactNode;
}

/**
 * This wraps a React component that is being tested with the redux store Provider.
 *
 * It can either be used by simply passing the component as the parameter, this will create a store
 * using the default initalState, or with a custom store provided as the second parameter.
 *
 * @param ui a ReactElement, to be wrapped within the Provider
 * @param store an optional custom store if needed for testing
 * @returns an object with the store and all of RTL's query functions
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({ reducer: storeItems, preloadedState }),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) => {
  const Wrapper: FC<IWrapperProps> = ({ children }) => {
    jest.mock('react-i18next', () => ({
      useTranslation: () => {
        return {
          t: (str: string) => str,
          i18n: {
            changeLanguage: () => new Promise(() => {}),
          },
        };
      },
    }));
    return <Provider store={store}>{children}</Provider>;
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
