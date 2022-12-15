import { IconAngleDown, IconAngleUp, IconCopy, IconMenuDots } from 'hds-react/icons';
import { IconButton, Title } from '../shared';
import { FC, MouseEventHandler } from 'react';

interface IPlanningListProjectsTableHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  group: any; // FIXME: this any will be removed ones we get the actual group model
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
        <div className="group-header-cell-content">
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
        </div>
      </th>
      {/**
       * TODO:
       * These cell values should listen to the current project card values for that year from redux:
       * 1. We patch the project card each time the user types a value
       * 2. The value will change in redux with the response
       * 3. We calculate the sum and display it for the user when a change in redux state is detected
       */}
      {/* FIXME: this any will be removed ones we get the actual group model */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
      {group.sums.map((rn: any, i: number) => (
        <th key={i} className="group-cell">
          {rn}
        </th>
      ))}
    </tr>
  );
};

export default PlanningListProjectsTableHeader;