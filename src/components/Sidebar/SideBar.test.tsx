import mockI18next from '@/mocks/mockI18next';
import SideBar from './SideBar';
import { renderWithProviders } from '@/utils/testUtils';
import { INavigationItem } from '@/interfaces/common';
import { screen } from '@testing-library/dom';

jest.mock('react-i18next', () => mockI18next());

describe('SideBar', () => {
  const navItems: Array<INavigationItem> = [
    {
      route: 'project-card',
      label: 'projectCard',
    },
  ];

  it('renders component wrapper', () => {
    renderWithProviders(<SideBar />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the correct amount of navItems', async () => {
    renderWithProviders(<SideBar />);
    expect(screen.getByTestId('sidebar').childElementCount).toBe(navItems.length);

    navItems.forEach((n) => {
      expect(
        screen.getByRole('button', {
          name: n.label,
        }),
      ).toBeInTheDocument();
    });
  });
});
