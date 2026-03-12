import { memo, useEffect, useState } from 'react';
import './styles.css';
import AdminMenusSideNavigation from './AdminMenusSideNavigation';
import AdminMenusCard from './AdminMenusCard';
import { menuCardItems } from './menuCardItems';
import AddOrEditMenuItemDialog from './AddOrEditMenuItemDialog';
import {
  DialogState,
  PersonTypeDialogValues,
  ReorderableListType,
} from '@/interfaces/menuItemsInterfaces';

const AdminMenus = () => {
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  const setActivePage = (id: string) => {
    setActiveMenuItem(id);
  };

  useEffect(() => {
    const sections = globalThis.document?.querySelectorAll("[id^='menu-card-']");
    if (!sections?.length) return;

    const observer = new globalThis.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;

            setActiveMenuItem(id);
            globalThis.history?.replaceState(null, '', `#${id}`);
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
    personTypeDialogValues: undefined,
  });

  const handleEdit = (
    value: string,
    editableItemId: string,
    path: string,
    listType: ReorderableListType,
    personTypeDialogValues?: PersonTypeDialogValues,
  ) => {
    setDialogState({
      open: true,
      mode: 'edit',
      value,
      editableItemId,
      path,
      listType,
      personTypeDialogValues,
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
      personTypeDialogValues: undefined,
    });
  };

  return (
    <div className="admin-menus-view">
      <AdminMenusSideNavigation active={activeMenuItem} setActivePage={setActivePage} />
      <div className="admin-menus-content">
        {menuCardItems.map((card) => {
          return (
            <AdminMenusCard
              path={card.path}
              listType={card.listType}
              useUntranslatedValues={card.useUntranslatedValues}
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
