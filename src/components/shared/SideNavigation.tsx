import { INavigationItem } from '@/interfaces/common';
import { SideNavigation as HDSSideNavigation } from 'hds-react/components/SideNavigation';
import { FC, useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

interface ISideNavigationProps {
  navItems: Array<INavigationItem>;
}

const SideNavigation: FC<ISideNavigationProps> = ({ navItems }) => {
  const [active, setActive] = useState('#basics');

  const { t } = useTranslation();
  const navigate = useNavigate();

  const setActivePage = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      e.preventDefault();
      const hash = e.target.hash || e.target.parentElement.hash;
      setActive(hash);
      navigate(hash);
      const scrollToElement = document.getElementById(hash.split('#')[1]);
      window.scrollTo({ top: (scrollToElement?.offsetTop || 0) - 40, behavior: 'smooth' });
    },
    [navigate],
  );

  const hdsNavItems = useMemo(
    () =>
      navItems.map((s, i) => ({
        ...s,
        href: s.route,
        onClick: setActivePage,
        active: active === s.route,
        id: `main-level-${i}`,
      })),
    [active, navItems, setActivePage],
  );

  return (
    <div className="w-full">
      <HDSSideNavigation
        id="side-navigation"
        toggleButtonLabel={t('nav.navigateToForm')}
        className="side-nav"
      >
        {hdsNavItems.map((s) => (
          <HDSSideNavigation.MainLevel {...s} key={s.href} />
        ))}
      </HDSSideNavigation>
    </div>
  );
};

export default memo(SideNavigation);
