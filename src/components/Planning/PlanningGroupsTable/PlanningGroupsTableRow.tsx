import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { planProjectValues } from '@/mocks/common';
import { getProjectPhasesThunk } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import {
  IconDocument,
  IconMenuDots,
  IconPlaybackRecord,
  IconSpeechbubbleText,
} from 'hds-react/icons';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PlanningGroupsTableCell from './PlanningGroupsTableCell';
import StatusDialog from './StatusDialog';

/**
 * RED CELLS
 * background: 'var(--color-suomenlinna-light)'
 * borderBottom: '4px solid var(--color-suomenlinna)'
 *
 * GREEN CELLS
 * ?
 *
 * BLUE CELLS
 * ?
 */

interface IPlanningProjectsTableProps {
  project: IProject;
  selectStatusDialog: (projectName: string) => void;
  closeStatusDialog: () => void;
  selectedDialog: string;
}

const CircleIcon = ({ value }: { value: string }) => (
  <div className="circle-number-icon">
    {value}
    <div className="circle-number-icon-indicator">!</div>
  </div>
);

/**
 * We're only mapping the project name here for now since the values aren't yet implemented
 */
const PlanningGroupsTableRow: FC<IPlanningProjectsTableProps> = ({
  project,
  selectStatusDialog,
  selectedDialog,
  closeStatusDialog,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const navigateToProject = () => navigate(`/project/${project.id}/basics`);
  const phases = useAppSelector((state: RootState) => state.lists.phase);

  useEffect(() => {
    dispatch(getProjectPhasesThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <tr>
      {/* HEADER */}
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* LEFT */}
          <div className="left">
            <IconMenuDots
              size="xs"
              style={{ cursor: 'pointer' }}
              onClick={() => selectStatusDialog(project?.name)}
            />
            {selectedDialog === project?.name && (
              <StatusDialog project={project} phases={phases} close={closeStatusDialog} />
            )}
            <IconDocument size="xs" />
            <button className="project-name-button" onClick={navigateToProject}>
              {project.name}
            </button>
          </div>
          {/* RIGHT */}
          <div className="right">
            <div className="project-header-left">
              <CircleIcon value={planProjectValues.readiness} />
              <IconPlaybackRecord size="xs" />
              <IconSpeechbubbleText size="xs" />
            </div>
            <div className="project-header-right">
              <span>{planProjectValues.value1}</span>
              <span>{planProjectValues.value2}</span>
            </div>
          </div>
        </div>
      </th>
      {planProjectValues.sums.map((p, i) => (
        <PlanningGroupsTableCell key={i} value={p} />
      ))}
    </tr>
  );
};

export default PlanningGroupsTableRow;
