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

const PlanningListProjectsTableRow: FC<IPlanningListProjectsTableProps> = ({ project }) => {
  return (
    <tr>
      {/* HEADER */}
      <th className="project-header-cell">
        {/* LEFT */}
        <div className="left">
          <IconMenuDots />
          <IconDocument />
          {project.name}
        </div>
        {/* RIGHT */}
        <div className="right">
          <div className="project-header-left">
            <div className="circle-number-icon">{project.readiness}</div>
            <IconPlaybackRecord />
            <IconSpeechbubbleText />
          </div>
          <div className="project-header-right">
            <span>{project.value1}</span>
            <span>{project.value2}</span>
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
