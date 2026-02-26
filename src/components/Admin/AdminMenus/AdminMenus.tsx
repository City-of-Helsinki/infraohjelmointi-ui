import { memo, useState } from 'react';
import './styles.css';
import AdminMenusSideNavigation from './AdminMenusSideNavigation';
import AdminMenusCard from './AdminMenusCard';
import { useEffect } from 'react';
import { menuCardItemContents } from './AdminMenusMenuCardItems';
import AddOrEditMenuItemDialog from './AddOrEditMenuItemDialog';
import { DialogState, ReorderableListType } from '@/interfaces/menuItemsInterfaces';

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
    value: '',
    editableItemId: '',
    path: '',
    listType: undefined,
  });

  const handleEdit = (
    value: string,
    editableItemId: string,
    path: string,
    listType: ReorderableListType,
  ) => {
    setDialogState({
      open: true,
      mode: 'edit',
      value,
      editableItemId,
      path,
      listType,
    });
  };

  const handleAdd = (path: string, listType: ReorderableListType) => {
    setDialogState({
      open: true,
      mode: 'add',
      value: '',
      path,
      editableItemId: '',
      listType,
    });
  };

  const handleClose = () => {
    setDialogState({
      mode: 'add',
      open: false,
      value: '',
      path: '',
      editableItemId: '',
      listType: undefined,
    });
  };

  return (
    <div className="admin-menus-view">
      <AdminMenusSideNavigation active={activeMenuItem} setActivePage={setActivePage} />
      <div className="admin-menus-content">
        {menuCardItemContents.map((card) => {
          return (
            <AdminMenusCard
              path={card.path}
              listType={card.listType}
              translateValues={card.translateValues}
              key={card.listType}
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
