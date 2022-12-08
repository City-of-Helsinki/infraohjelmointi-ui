import {
  IconDocument,
  IconMenuDots,
  IconPlaybackRecord,
  IconSpeechbubbleText,
} from 'hds-react/icons';
import { FC } from 'react';

interface IPlanningListProjectsTableProps {
  project: any;
}

const CircleIcon = ({ value }: { value: string }) => (
  <div className="circle-number-icon">
    {value}
    <div className="circle-number-icon-indicator">!</div>
  </div>
);

const PlanningListProjectsTableRow: FC<IPlanningListProjectsTableProps> = ({ project }) => {
  return (
    <tr>
      {/* HEADER */}
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* LEFT */}
          <div className="left">
            <IconMenuDots />
            <IconDocument />
            {project.name}
          </div>
          {/* RIGHT */}
          <div className="right">
            <div className="project-header-left">
              <CircleIcon value={project.readiness} />
              <IconPlaybackRecord />
              <IconSpeechbubbleText />
            </div>
            <div className="project-header-right">
              <span>{project.value1}</span>
              <span>{project.value2}</span>
            </div>
          </div>
        </div>
      </th>
      {project.sums.map((p: any, i: number) => (
        <td key={i} className="project-cell">
          {p}
        </td>
      ))}
    </tr>
  );
};

export default PlanningListProjectsTableRow;
