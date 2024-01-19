import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/common';
import { setConfirmPromptOpen } from '@/reducers/planningSlice';
import { t } from "i18next";
import './style.css';
import { ProjectNotes } from '../Project/ProjectNotes';
import { ProjectBasics } from '../Project/ProjectBasics';
import { useState } from 'react';

interface IProjectDetailsProps {
  projectMode: 'edit' | 'new';
}

const ProjectDetailsForm = ({ projectMode }: IProjectDetailsProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const [isDirty, setIsDirty] = useState(false);

  const getIsDirty = (isDirty: boolean) => {
    setIsDirty(isDirty)
  }

  const onBasicsPage = location.includes("basics");
  const onNotesPage = location.includes('notes');
  const creatingNewProject = location.includes('new');

  const checkIsDirty = (route: string) => {
    /* isDirty doesn't turn back to false (if there were some unsaved changes in the form) when navigating from basics
       to notes so we don't do a check for dirty values when going back from notes to basics */
    if (isDirty && route !== 'basics') {
        dispatch(setConfirmPromptOpen(true));
      } else {
        navigate(route);
      }
    };

  return (
    <div data-testid="tabs-list">
      <div className='button-container'>
        <button className={onNotesPage ? 'button' : 'buttonHighlighted'} onClick={() => checkIsDirty('basics')}>{t('basicInfo')}</button>
        { projectMode !== 'new' &&
          <button className={onBasicsPage ? 'button' : 'buttonHighlighted'} onClick={() => checkIsDirty('notes')}>{t('notes')}</button>
        }
      </div>
        {onBasicsPage ||  creatingNewProject? 
            <ProjectBasics getIsDirty={getIsDirty} />
            : 
            <ProjectNotes />
        }
    </div>
  );
};

export default ProjectDetailsForm;
