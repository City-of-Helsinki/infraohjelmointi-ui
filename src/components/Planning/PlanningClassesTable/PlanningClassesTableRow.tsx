import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { BubbleIcon, IconButton, Span } from '../../shared';
import { FC, memo, ReactNode, useCallback, useState } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { classSums } from '@/mocks/common';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

export type ClassType = 'masterClass' | 'class' | 'subClass';

interface IPlanningClassTableRowProps {
  projectClass: IClass;
  type: ClassType;
  children?: ReactNode;
}

// eslint-disable-next-line react/display-name
const OverrunSum = memo(({ value }: { value: string }) => (
  <span>
    <BubbleIcon value="y" color="white" size="s" />
    {`+${value}`}
  </span>
));

const PlanningClassTableRow: FC<IPlanningClassTableRowProps> = ({
  projectClass,
  type,
  children,
}) => {
  const { masterClassId, classId } = useParams();
  const [expandChildren, setExpandChildren] = useState(false);

  const handleExpandChildren = useCallback(() => setExpandChildren((current) => !current), []);

  const buildLink = () => {
    switch (type) {
      case 'masterClass':
        return projectClass.id;
      case 'class':
        return `${masterClassId}/${projectClass.id}`;
      case 'subClass':
        return `${masterClassId}/${classId}/${projectClass.id}`;
    }
  };

  return (
    <>
      <tr>
        {/* Header with cell name */}
        <th className={`class-header-cell ${type}`}>
          <div>
            <div className="class-header-content-item value-container">
              {/* TODO: class code/number here */}
              <span>{}</span>
            </div>
            <div className={`class-header-content ${type}`}>
              <div className="class-header-content-item">
                <Link to={buildLink()} className="display-flex">
                  <IconButton
                    icon={expandChildren ? IconAngleUp : IconAngleDown}
                    color="white"
                    onClick={handleExpandChildren}
                  />
                </Link>
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
              {i === 0 ? (
                // Add overright icon for the first cell of every row
                <OverrunSum value={rn} />
              ) : (
                // Only display the value for the rest of the cells
                <span>{rn}</span>
              )}

              <span>{i === 0 && `${rn}`}</span>
            </div>
          </td>
        ))}
      </tr>
      {expandChildren && children}
    </>
  );
};

export default memo(PlanningClassTableRow);
