import { IconAngleDown, IconAngleUp, IconCopy, IconMenuDots } from 'hds-react/icons';
import { IconButton, Title } from '../shared';
import { FC, MouseEventHandler } from 'react';

interface IPlanningListProjectsTableHeaderProps {
  group: any;
  isProjectsVisible: boolean;
  handleProjectsVisible: MouseEventHandler<HTMLButtonElement>;
}

const PlanningListProjectsTableHeader: FC<IPlanningListProjectsTableHeaderProps> = ({
  group,
  isProjectsVisible,
  handleProjectsVisible,
}) => {
  return (
    <tr>
      {/* HEADER */}
      <th className="group-header-cell">
        <div className="left">
          <IconButton
            icon={isProjectsVisible ? IconAngleUp : IconAngleDown}
            color="white"
            onClick={handleProjectsVisible}
          />
          <IconMenuDots />
          <Title size="s" text={group.name} color="white" /> <IconCopy />
        </div>
        <div className="right">
          <span>{group.value1}</span>
          <span>{group.value2}</span>
        </div>
      </th>
      {/* CELLS */}
      {group.sums.map((rn: any, i: number) => (
        <th key={i} className="group-cell">
          {rn}
        </th>
      ))}
    </tr>
  );
};

export default PlanningListProjectsTableHeader;
