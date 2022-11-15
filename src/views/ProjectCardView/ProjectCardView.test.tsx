import React from 'react';
import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardView from './ProjectCardView';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectCardView', () => {
  beforeEach(() => renderWithProviders(<ProjectCardView />));
  it('title should render', () => {
    expect(screen.getByText(/projectCard.projectCard/i)).toBeInTheDocument();
  });
  it('should get project card data on render', () => {
    expect(screen.getByText(/Project card fetched/i)).toBeInTheDocument();
  });
});
