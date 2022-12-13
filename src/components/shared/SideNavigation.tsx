import { INavigationItem } from '@/interfaces/common';
import { SideNavigation as HDSSideNavigation } from 'hds-react/components/SideNavigation';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

interface ISideNavigationProps {
  navItems: Array<INavigationItem>;
}

const SideNavigation: FC<ISideNavigationProps> = ({ navItems }) => {
  const [active, setActive] = useState('#basics');
  const { t } = useTranslation();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setActivePage = (e: any) => {
    e.preventDefault();
    setActive(e.target.getAttribute('href'));
    navigate(e.target.getAttribute('href'));
  };

  const hdsNavItems = navItems.map((s, i) => ({
    ...s,
    href: s.route,
    onClick: setActivePage,
    active: active === s.route,
    id: `main-level-${i}`,
  }));

  return (
    <HDSSideNavigation
      id="side-navigation"
      toggleButtonLabel={t('nav.navigateToForm')}
      className="side-nav"
    >
      {hdsNavItems.map((s) => (
        <HDSSideNavigation.MainLevel {...s} key={s.href} />
      ))}
    </HDSSideNavigation>
  );
};

export default SideNavigation;
