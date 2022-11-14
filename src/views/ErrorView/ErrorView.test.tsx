import React from 'react';
import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import ErrorView from './ErrorView';

jest.mock('react-i18next', () => mockI18next());

describe('ErrorView', () => {
  renderWithProviders(<ErrorView />);
  it('title should render', () => {
    expect(screen.getByText(/error.404/i)).toBeInTheDocument();
  });
});
