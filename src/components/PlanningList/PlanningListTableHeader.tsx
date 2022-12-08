import { IconAngleDown, IconAngleUp, IconCopy, IconMenuDots } from 'hds-react/icons';
import { IconButton, Title } from '../shared';
import { FC, MouseEventHandler } from 'react';

const randomNumbers = ['360', '360', '360', '360', '360', '360', '360', '360', '360', '360', '360'];

interface IPlanningListTableHeaderProps {
  isProjectsVisible: boolean;
  handleProjectsVisible: MouseEventHandler<HTMLButtonElement>;
}

const PlanningListTableHeader: FC<IPlanningListTableHeaderProps> = ({
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
          <Title size="s" text="Hakaniemi" color="white" /> <IconCopy />
        </div>
        <div className="right">
          <span>3 400</span>
          <span style={{ fontWeight: '300' }}>2 700</span>
        </div>
      </th>
      {/* CELLS */}
      {randomNumbers.map((rn, i) => (
        <th key={i} className="group-cell">
          {rn}
        </th>
      ))}
    </tr>
  );
};

export default PlanningListTableHeader;
