import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { IconButton, Span } from '../../shared';
import { FC, memo, ReactNode, useCallback, useState } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { classSums } from '@/mocks/common';

export type ClassType = 'masterClass' | 'class' | 'subClass';

interface IPlanningClassTableRowProps {
  projectClass: IClass;
  type: ClassType;
  children?: ReactNode;
}

const PlanningClassTableRow: FC<IPlanningClassTableRowProps> = ({
  projectClass,
  type,
  children,
}) => {
  const [expandChildren, setExpandChildren] = useState(false);

  const handleExpandChildren = useCallback(() => {
    setExpandChildren((current) => !current);
  }, []);

  return (
    <>
      <tr>
        {/* Header with cell name */}
        <th className={`class-header-cell ${type}`}>
          <div>
            <div className="class-header-content-item value-container">
              <span>{180}</span>
            </div>
            <div className={`class-header-content ${type}`}>
              <div className="class-header-content-item">
                <IconButton
                  icon={expandChildren ? IconAngleUp : IconAngleDown}
                  color="white"
                  onClick={handleExpandChildren}
                />
              </div>
              <div className="class-header-content-item">
                <IconMenuDots size="xs" />
              </div>
              <div className="class-header-content-item">
                <span></span>
                <Span fontWeight="bold" size="s" text={projectClass.name} color="white" />
              </div>
            </div>
          </div>
        </th>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {classSums.map((rn: any, i: number) => (
          <td key={i} className={`class-cell ${type}`}>
            <div className="class-cell-container">
              <span>{rn}</span>
              <span>{rn}</span>
              <span>{i === 0 && rn}</span>
            </div>
          </td>
        ))}
      </tr>
      {expandChildren && children}
    </>
  );
};

export default memo(PlanningClassTableRow);
