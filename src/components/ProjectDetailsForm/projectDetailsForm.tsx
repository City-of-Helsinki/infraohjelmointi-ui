import { useLocation, useNavigate } from 'react-router-dom';
import { t } from "i18next";
import './style.css';
import { ProjectNotes } from '../Project/ProjectNotes';
import { ProjectBasics } from '../Project/ProjectBasics';

interface IProjectDetailsProps {
  projectMode: 'edit' | 'new';
}

const ProjectDetailsForm = ({ projectMode }: IProjectDetailsProps) => {
  const navigate = useNavigate();
  const location = useLocation().pathname;
 
  const onBasicsPage = location.includes("basics");
  const onNotesPage = location.includes('notes');
  const creatingNewProject = location.includes('new');

  return (
    <div data-testid="tabs-list">
      <div className='button-container'>
        <button className={onNotesPage ? 'button' : 'buttonHighlighted'} onClick={() => navigate('basics')}>{t('basicInfo')}</button>
        { projectMode !== 'new' &&
          <button className={onBasicsPage ? 'button' : 'buttonHighlighted'} onClick={() => navigate('notes')}>{t('notes')}</button>
        }
      </div>
        {onBasicsPage || creatingNewProject ? 
            <ProjectBasics />
            : 
            <ProjectNotes />
        }
    </div>
  );
};

export default ProjectDetailsForm;
