import { IProject } from '@/interfaces/projectInterfaces';
import { planProjectValues } from '@/mocks/common';
import {
  IconDocument,
  IconMenuDots,
  IconPlaybackRecord,
  IconSpeechbubbleText,
} from 'hds-react/icons';
import { FC } from 'react';
import { useNavigate } from 'react-router';
import PlanningGroupsTableCell from './PlanningGroupsTableCell';
import { PhaseDialog } from '../PhaseDialog';
import { IListItem } from '@/interfaces/common';

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
  phases: Array<IListItem>;
  selectedDialog: string;
  selectPhaseDialog: (projectName: string) => void;
  closePhaseDialog: () => void;
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
  phases,
  selectPhaseDialog,
  selectedDialog,
  closePhaseDialog,
}) => {
  const navigate = useNavigate();
  const navigateToProject = () => navigate(`/project/${project.id}/basics`);

  return (
    <tr>
      {/* HEADER */}
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* LEFT */}
          <div className="left">
            <IconMenuDots
              size="xs"
              className="dots-icon"
              onClick={() => selectPhaseDialog(project?.name)}
            />
            {selectedDialog === project?.name && (
              <PhaseDialog project={project} phases={phases} close={closePhaseDialog} />
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
