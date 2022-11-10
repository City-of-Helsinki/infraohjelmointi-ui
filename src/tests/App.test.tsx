import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-utils';
import App from '../App';
import { setupStore } from '../store';
import { customMessage } from '../reducers/testSlice';

/**
 * These tests are just for testing the redux changes and Provider wrapper for tests, can be removed later.
 */
test('changes info text from redux state upon button click', async () => {
  renderWithProviders(<App />);

  // Should say "Hello World initially"
  expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
  expect(screen.queryByText(/Hello Infraohjelmointi/i)).not.toBeInTheDocument();

  // Should say "Hello Infraohjelmointi after button click"
  fireEvent.click(screen.getByRole('button', { name: /Change message/i }));
  expect(await screen.findByText(/Hello Infraohjelmointi/i)).toBeInTheDocument();
});

test('a custom message can be dispatched as the initialState before rendering App', async () => {
  const store = setupStore();
  store.dispatch(customMessage('Goodbye World'));

  renderWithProviders(<App />, { store });

  // Should say "Goodbye World" instead of the default "Hello World"
  expect(screen.getByText(/Goodbye World/i)).toBeInTheDocument();
  expect(screen.queryByText(/Hello World/i)).not.toBeInTheDocument();
});

test('the store can be initialized with a custom message', async () => {
  const initialMessage = { message: 'Goodbye World' };

  renderWithProviders(<App />, {
    preloadedState: {
      test: initialMessage,
    },
  });

  // Should say "Goodbye World" instead of the default "Hello World"
  expect(screen.getByText(/Goodbye World/i)).toBeInTheDocument();
  expect(screen.queryByText(/Hello World/i)).not.toBeInTheDocument();
});
