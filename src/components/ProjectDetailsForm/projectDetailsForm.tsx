import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import './style.css';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { isUserOnlyViewer } from '@/utils/userRoleHelpers';
import useTalpaLists from '@/hooks/useTalpaLists';

interface IProjectDetailsProps {
  projectMode: 'edit' | 'new';
}

const ProjectDetailsForm = ({ projectMode }: IProjectDetailsProps) => {
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const user = useAppSelector(selectUser);
  const isOnlyViewer = isUserOnlyViewer(user);
  useTalpaLists();

  const onBasicsPage = location.includes('basics');
  const onNotesPage = location.includes('notes');
  const onTalpaPage = location.includes('talpa');

  return (
    <div data-testid="tabs-list">
      <div className="button-container">
        <button
          role="link"
          className={onBasicsPage ? 'buttonHighlighted' : 'button'}
          onClick={() => navigate('basics')}
        >
          {t('basicInfo')}
        </button>
        {projectMode !== 'new' && !isOnlyViewer && (
          <button
            role="link"
            className={onNotesPage ? 'buttonHighlighted' : 'button'}
            onClick={() => navigate('notes')}
          >
            {t('notes')}
          </button>
        )}
        {projectMode !== 'new' && !isOnlyViewer && (
          <button
            role="link"
            className={onTalpaPage ? 'buttonHighlighted' : 'button'}
            onClick={() => navigate('talpa')}
          >
            {t('talpa')}
          </button>
        )}
      </div>

      <Outlet />
    </div>
  );
};

export default ProjectDetailsForm;
