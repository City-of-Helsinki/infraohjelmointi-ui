import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasics from './ProjectCardBasics';

jest.mock('react-i18next', () => mockI18next());

describe.skip('ProjectCardBasics', () => {
  const navItems = [
    {
      route: 'basics',
      label: 'nav.basics',
    },
  ];

  it('renders all component wrappers', async () => {
    const { container } = renderWithProviders(<ProjectCardBasics />);
    expect(container.getElementsByClassName('project-card-content-container').length).toBe(1);
    expect(container.getElementsByClassName('side-panel').length).toBe(1);
    expect(container.getElementsByClassName('form-panel').length).toBe(1);
  });

  it('renders SideNavigation and links', () => {
    const { container, getByRole } = renderWithProviders(<ProjectCardBasics />);
    expect(container.getElementsByClassName('side-nav').length).toBe(1);

    navItems.forEach((n) => {
      expect(
        getByRole('link', {
          name: n.label,
        }),
      ).toBeInTheDocument();
    });
  });

  it('renders ProjectCardBasicsForm', () => {
    const { container } = renderWithProviders(<ProjectCardBasics />);
    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });
});
