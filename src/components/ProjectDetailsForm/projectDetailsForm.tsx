import { Outlet, useLocation } from 'react-router-dom';
import { t } from 'i18next';
import './style.css';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { isUserOnlyViewer } from '@/utils/userRoleHelpers';
import useTalpaLists from '@/hooks/useTalpaLists';
import Link from '../shared/Link';
import useRestrictedClassAccess from '@/hooks/useRestrictedClassAccess';

interface IProjectDetailsProps {
  projectMode: 'edit' | 'new';
}

const ProjectDetailsForm = ({ projectMode }: IProjectDetailsProps) => {
  const location = useLocation().pathname;
  const user = useAppSelector(selectUser);
  const isOnlyViewer = isUserOnlyViewer(user);
  // Restricted programmers (IO-756) can't use Talpa or construction handovers
  const { isRestricted } = useRestrictedClassAccess();
  useTalpaLists();

  const onBasicsPage = location.includes('basics');
  const onNotesPage = location.includes('notes');
  const onTalpaPage = location.includes('talpa');
  const onProjectProgrammePage = location.includes('project-programme');
  const onConstructionHandoverPage = location.includes('construction-handover');

  return (
    <div data-testid="tabs-list">
      <div className="button-container">
        <Link className={`button ${onBasicsPage ? 'buttonHighlighted' : ''}`} href="basics">
          {t('basicInfo')}
        </Link>
        {projectMode !== 'new' && !isOnlyViewer && (
          <Link className={`button ${onNotesPage ? 'buttonHighlighted' : ''}`} href="notes">
            {t('notes')}
          </Link>
        )}
        {projectMode !== 'new' && !isOnlyViewer && !isRestricted && (
          <Link className={`button ${onTalpaPage ? 'buttonHighlighted' : ''}`} href="talpa">
            {t('talpa')}
          </Link>
        )}
        {projectMode !== 'new' && !isOnlyViewer && (
          <Link
            className={`button ${onProjectProgrammePage ? 'buttonHighlighted' : ''}`}
            href="project-programme"
          >
            {t('projectProgramme')}
          </Link>
        )}
        {projectMode !== 'new' && !isOnlyViewer && !isRestricted && (
          <Link
            className={`button ${onConstructionHandoverPage ? 'buttonHighlighted' : ''}`}
            href="construction-handover"
          >
            {t('constructionHandover')}
          </Link>
        )}
      </div>

      <Outlet />
    </div>
  );
};

export default ProjectDetailsForm;
