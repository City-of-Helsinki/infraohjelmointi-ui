import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardHeader from './ProjectCardHeader';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectCardHeader', () => {
  it('renders component wrapper', () => {
    const { container } = renderWithProviders(<ProjectCardHeader />);

    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
    expect(container.getElementsByClassName('header-row').length).toBe(1);
    expect(container.getElementsByClassName('header-row')[0].childElementCount).toBe(2);
  });

  it('render 2 columns for content', () => {
    const { container } = renderWithProviders(<ProjectCardHeader />);

    expect(container.getElementsByClassName('header-column').length).toBe(2);
  });

  it('renders all left side elements', () => {
    const { container } = renderWithProviders(<ProjectCardHeader />);

    expect(container.getElementsByClassName('progress-indicator-container').length).toBe(1);
    expect(screen.getByTestId('project-name')).toBeInTheDocument();
    expect(screen.getByTestId('project-address')).toBeInTheDocument();
    expect(screen.getByTestId('project-phase-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('project-phase-dropdown').childElementCount).toBe(1);
  });

  it('renders all right side elements', async () => {
    const { container } = renderWithProviders(<ProjectCardHeader />);

    expect(container.getElementsByClassName('favourite-button')[0]);
    expect(screen.getByTestId('in-group')).toBeInTheDocument();
    expect(screen.getByTestId('pc-group')).toBeInTheDocument();
  });

  it('can add and remove favourites', async () => {
    const { user, container } = renderWithProviders(<ProjectCardHeader />);

    expect(screen.getByText(/addFavourite/i)).toBeInTheDocument();
    await user.click(container.getElementsByClassName('favourite-button')[0]);
    expect(screen.getByText(/removeFavourite/i)).toBeInTheDocument();
  });
});
