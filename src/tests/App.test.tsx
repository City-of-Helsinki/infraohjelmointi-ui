import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-utils';
import App from '../App';

/**
 * These tests are just for testing the redux changes and Provider wrapper for tests, can be removed later.
 */
test('App title should load', async () => {
  renderWithProviders(<App />);

  // Should say "Hello World initially"
  expect(screen.getByText(/Infraohjelmointi UI/i)).toBeInTheDocument();
});
