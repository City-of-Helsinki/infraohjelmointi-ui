import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasics from './ProjectCardBasics';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectCardBasics', () => {
  it('title should render', async () => {
    renderWithProviders(<ProjectCardBasics />);
    expect(screen.getByText(/basicInfo/i)).toBeInTheDocument();
  });
});
