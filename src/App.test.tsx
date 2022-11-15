import React from 'react';
import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './utils/testUtils';
import App from './App';

jest.mock('react-i18next', () => mockI18next());

describe('App', () => {
  it('title should render', () => {
    renderWithProviders(<App />);

    expect(screen.getByText(/appTitle/i)).toBeInTheDocument();
  });
});
