import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardToolbar from './ProjectCardToolbar';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectCardToolbar', () => {
  it('renders component wrapper', () => {
    const { container } = renderWithProviders(<ProjectCardToolbar />);
    expect(container.getElementsByClassName('project-card-toolbar-container').length).toBe(1);
  });

  it('renders two containers', () => {
    const { container } = renderWithProviders(<ProjectCardToolbar />);
    expect(container.getElementsByClassName('display-flex').length).toBe(2);
  });

  it('renders all right left elements', () => {
    const { container } = renderWithProviders(<ProjectCardToolbar />);
    expect(container.getElementsByClassName('display-flex')[0].childElementCount).toBe(2);
    expect(screen.getByTestId('new-project-button')).toBeInTheDocument();
    expect(screen.getByTestId('share-project-button')).toBeInTheDocument();
  });

  it('renders all left side elements', () => {
    const { container } = renderWithProviders(<ProjectCardToolbar />);
    expect(container.getElementsByClassName('display-flex')[1].childElementCount).toBe(1);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});
