import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { IconButton } from '../../shared';
import { FC, MouseEventHandler } from 'react';

interface IPlanningGroupsTableHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  group: any; // FIXME: this any will be removed ones we get the actual group model
  isProjectsVisible: boolean;
  handleProjectsVisible: MouseEventHandler<HTMLButtonElement>;
}

const PlanningGroupsTableHeader: FC<IPlanningGroupsTableHeaderProps> = ({
  group,
  isProjectsVisible,
  handleProjectsVisible,
}) => {
  return (
    <thead>
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
              <h4 className="text-heading-s text-white">{group.name}</h4>
            </div>
            <div className="right">
              <span>{group.value1}</span>
              <span>{group.value2}</span>
            </div>
          </div>
        </th>
        {/**
         * TODO:
         * These cell values should listen to the current project values for that year from redux:
         * 1. We patch the project each time the user types a value
         * 2. The value will change in redux with the response
         * 3. We calculate the sum and display it for the user when a change in redux state is detected
         */}
        {/* FIXME: this any will be removed ones we get the actual group model */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {group.sums.map((rn: any, i: number) => (
          <th key={i} className="group-cell">
            <span>{rn}</span>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default PlanningGroupsTableHeader;
