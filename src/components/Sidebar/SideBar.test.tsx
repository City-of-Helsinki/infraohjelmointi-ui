import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import SideBar from './SideBar';
import { INavigationItem } from '@/interfaces/common';
import { IconPenLine } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => mockI18next());

describe('SideBar', () => {
  const { t } = useTranslation();
  const navItems: Array<INavigationItem> = [
    {
      route: 'project-card',
      label: t('projectCard'),
      component: <IconPenLine />,
    },
  ];

  it('renders component wrapper', () => {
    const { container } = renderWithProviders(<SideBar />);
    expect(container.getElementsByClassName('sidebar-container').length).toBe(1);
  });

  it('renders the correct amount of navItems', () => {
    const { container } = renderWithProviders(<SideBar />);
    const sideBarElement = container.getElementsByClassName('sidebar-container')[0];
    expect(sideBarElement.childElementCount).toBe(navItems.length);
  });
});
