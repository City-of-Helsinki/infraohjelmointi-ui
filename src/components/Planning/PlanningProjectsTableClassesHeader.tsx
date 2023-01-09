import { IconAngleDown, IconAngleUp, IconCopy, IconMenuDots } from 'hds-react/icons';
import { IconButton, Span } from '../shared';
import { FC } from 'react';

interface IPlanningProjectsTableClassesHeaderProps {
  name: string;
  index: string;
  value: string | null;
  sums: Array<string | null>;
  handleClick: any;
  isVisible: boolean;
}

const PlanningProjectsTableClassesHeader: FC<IPlanningProjectsTableClassesHeaderProps> = ({
  name,
  index,
  value,
  sums,
  handleClick,
  isVisible,
}) => {
  return isVisible ? (
    <tr>
      <th className={`class-header-cell class-${index}`}>
        <div style={{ display: 'flex' }}>
          <div className="class-header-content-item value-container">
            <span>{value}</span>
          </div>
          <div className={`class-header-content class-${index}`}>
            <div className="class-header-content-item">
              <IconButton
                icon={isVisible ? IconAngleUp : IconAngleDown}
                color="white"
                onClick={handleClick}
              />
            </div>
            <div className="class-header-content-item">
              <IconMenuDots size="xs" />
            </div>
            <div className="class-header-content-item">
              <span></span>
              <Span fontWeight="bold" size="s" text={name} color="white" />{' '}
            </div>
            <div className="class-header-content-item">
              <IconCopy size="xs" />
            </div>
          </div>
        </div>
      </th>

      {/**
       * TODO:
       * These cell values should en to the current project card values for that year from redux:
       * 1. We patch the project card each time the user types a value
       * 2. The value will change in redux with the response
       * 3. We calculate the sum and display it for the user when a change in redux state is detected
       */}
      {/* FIXME: this any will be removed ones we get the actual group model */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
      {sums.map((rn: any, i: number) => (
        <th key={i} className={`class-cell class-${index}`}>
          <div className="class-cell-container">
            <span>{rn}</span>
            <span>{rn}</span>
            <span>{i === 0 && rn}</span>
          </div>
        </th>
      ))}
    </tr>
  ) : null;
};

export default PlanningProjectsTableClassesHeader;
