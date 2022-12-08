import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { planListProjectValues } from '@/mocks/common';
import {
  IconDocument,
  IconMenuDots,
  IconPlaybackRecord,
  IconSpeechbubbleText,
} from 'hds-react/icons';
import { FC } from 'react';
import { useNavigate } from 'react-router';

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

interface IPlanningListProjectsTableProps {
  project: IProjectCard;
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
const PlanningListProjectsTableRow: FC<IPlanningListProjectsTableProps> = ({ project }) => {
  const navigate = useNavigate();
  const navigateToProjectCard = () => navigate(`/project-card/${project.id}`);
  return (
    <tr>
      {/* HEADER */}
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* LEFT */}
          <div className="left">
            <IconMenuDots />
            <IconDocument />
            <button onClick={navigateToProjectCard}>{project.name}</button>
          </div>
          {/* RIGHT */}
          <div className="right">
            <div className="project-header-left">
              <CircleIcon value={planListProjectValues.readiness} />
              <IconPlaybackRecord />
              <IconSpeechbubbleText />
            </div>
            <div className="project-header-right">
              <span>{planListProjectValues.value1}</span>
              <span>{planListProjectValues.value2}</span>
            </div>
          </div>
        </div>
      </th>
      {planListProjectValues.sums.map((p, i) => (
        <td
          key={i}
          className="project-cell"
          style={{
            background: p ? 'var(--color-suomenlinna-light)' : 'var(--color-bus-light)',
            borderBottom: p ? '4px solid var(--color-suomenlinna)' : 'none',
          }}
        >
          {p}
        </td>
      ))}
    </tr>
  );
};

export default PlanningListProjectsTableRow;
