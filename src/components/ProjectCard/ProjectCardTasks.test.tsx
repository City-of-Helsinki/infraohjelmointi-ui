import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import ProjectCardTasks from './ProjectCardTasks';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectCardTasks', () => {
  renderWithProviders(<ProjectCardTasks />);
  it('title should render', async () => {
    expect(screen.getByText(/tasks/i)).toBeInTheDocument();
  });
});
