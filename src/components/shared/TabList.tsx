import { useLocation, useNavigate } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { FC } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { setConfirmPromptOpen } from '@/reducers/planningSlice';
import { t } from "i18next";
interface ITabListProps {
  navItems: Array<INavigationItem>;
  isDirty?: boolean;
  projectMode: 'edit' | 'new';
}

const TabList: FC<ITabListProps> = ({ navItems, isDirty, projectMode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation().pathname;

  const basics = navItems.find((item) => item.route.includes('basics'));
  const notes = navItems.find((item) => item.route.includes('notes'));
  const newProject = navItems.find((item) => item.route.includes('new'));

  const checkIsDirty = (route: string) => {
    /* isDirty doesn't turn back to false while navigating from basics to notes so 
      we don't do a check for dirty values when going from notes to basics */
    if (isDirty && route !== 'basics') {
        dispatch(setConfirmPromptOpen(true));
      } else {
        navigate(route);
      }
    };

  return (
    <div data-testid="tabs-list">
      <div>
        <button onClick={() => checkIsDirty('basics')}>{t('basicInfo')}</button>
        { projectMode !== 'new' &&
          <button onClick={() => checkIsDirty('notes')}>{t('notes')}</button>
        }
      </div>
      {location.includes("basics") ? basics?.component : notes?.component}
      {projectMode && projectMode === 'new' && newProject?.component}
    </div>
  );
};

export default TabList;
