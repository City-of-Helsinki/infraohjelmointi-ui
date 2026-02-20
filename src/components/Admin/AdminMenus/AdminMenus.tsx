import { memo, useState } from 'react';
import './styles.css';
import AdminMenusSideNavigation from './AdminMenusSideNavigation';
import AdminMenusCard from './AdminMenusCard';
import { useEffect } from 'react';
import { menuCardItemContents } from './AdminMenusMenuCardItems';
import { DialogState } from './AdminMenus.types';
import AddOrEditMenuItemDialog from './AddOrEditMenuItemDialog';

const AdminMenus = () => {
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  const setActivePage = (id: string) => {
    setActiveMenuItem(id);
  };

  useEffect(() => {
    const sections = document.querySelectorAll("[id^='menu-card-']");

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;

            setActiveMenuItem(id);
            window.history.replaceState(null, '', `#${id}`);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60% 0px',
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    mode: 'add',
    menuType: undefined,
    value: '',
    rowIndex: undefined,
  });

  const handleEdit = (menuType: string, value: string, rowIndex: number) => {
    setDialogState({
      open: true,
      mode: 'edit',
      menuType,
      value,
      rowIndex,
    });
  };

  const handleAdd = (menuType: string) => {
    setDialogState({
      open: true,
      mode: 'add',
      menuType,
      value: '',
    });
  };

  const handleClose = () => {
    setDialogState({
      mode: 'add',
      open: false,
      value: '',
      rowIndex: undefined,
      menuType: undefined,
    });
  };

  return (
    <div className="admin-menus-view">
      <AdminMenusSideNavigation active={activeMenuItem} setActivePage={setActivePage} />
      <div className="admin-menus-content">
        {menuCardItemContents.map((card) => {
          return (
            <AdminMenusCard
              menuType={card.menuType}
              listName={card.listName}
              translateValues={card.translateValues}
              key={card.menuType}
              onEditMenuItem={handleEdit}
              onAddMenuItem={handleAdd}
            />
          );
        })}
      </div>
      <AddOrEditMenuItemDialog dialogState={dialogState} handleClose={handleClose} />
    </div>
  );
};

export default memo(AdminMenus);
