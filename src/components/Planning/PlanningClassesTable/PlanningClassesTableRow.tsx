import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { BubbleIcon, IconButton } from '../../shared';
import { FC, memo, ReactNode, useCallback, useEffect, useState } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { classSums } from '@/mocks/common';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { ClassTableHierarchy } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';

interface IPlanningClassesTableRowProps {
  item: IClass | ILocation;
  hierarchy: ClassTableHierarchy;
  type: 'class' | 'location';
  children?: ReactNode;
  initiallyExpanded?: true;
}

// eslint-disable-next-line react/display-name
const OverrunSum = memo(({ value }: { value: string }) => (
  <span className="text-sm">
    <BubbleIcon value="y" color="white" size="s" />
    {`+${value}`}
  </span>
));

const PlanningClassesTableRow: FC<IPlanningClassesTableRowProps> = ({
  item,
  hierarchy,
  type,
  children,
  initiallyExpanded,
}) => {
  const { masterClassId, classId } = useParams();
  const [expanded, setExpanded] = useState(initiallyExpanded || false);

  const handleExpanded = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    setExpanded(initiallyExpanded || false);
  }, [initiallyExpanded]);

  const buildLink = useCallback(() => {
    return [masterClassId, classId, item.id]
      .join('/')
      .replace(/(\/\/)/gm, '/') // replace double // with one in case of one of values is undefined/null
      .replace(/(^\/)|(\/$)/gm, ''); // remove the last and first / in case of the last one of values is undefined/null
  }, [item.id, masterClassId, classId]);

  return (
    <>
      <tr>
        {/* Header with cell name */}
        <th className={`table-header-cell ${type} ${hierarchy}`}>
          <div style={{ position: 'relative' }}>
            <div className={`table-header-content ${hierarchy}`}>
              <div className={`table-header-content-item`}>
                <Link to={buildLink()} className="flex">
                  <IconButton
                    icon={expanded ? IconAngleUp : IconAngleDown}
                    color={type === 'class' ? 'white' : 'black'}
                    onClick={handleExpanded}
                  />
                </Link>
              </div>
              {/* hide dots menu from districts */}
              {type !== 'location' && hierarchy !== ClassTableHierarchy.Second && (
                <div className={`table-header-content-dots`}>
                  <IconMenuDots size="xs" />
                </div>
              )}
              <div className={`table-header-content-item`}>
                <div className={`table-title-container`}>
                  {/* <Span
                    fontWeight={type === 'class' ? 'bold' : 'medium'}
                    text={item.name}
                    color={type === 'class' ? 'white' : 'black'}
                  /> */}
                  <span className="font-bold text-white">{item.name}</span>
                </div>
                {/* Tooltip (visible if the header-content-item container is hovered) */}
                <section className="tooltip-container">
                  {item.name}
                  <div className="tooltip-arrow" />
                </section>
              </div>
            </div>
          </div>
        </th>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {classSums.map((rn: any, i: number) => (
          <td key={i} className={`table-cell ${type} ${hierarchy}`}>
            <div className={`table-cell-container`}>
              <span>{rn}</span>
              {i === 0 ? (
                // Add overright icon for the first cell of every row
                <OverrunSum value={rn} />
              ) : (
                // Only display the value for the rest of the cells
                <span className="text-sm">{rn}</span>
              )}

              <span className="text-sm">{i === 0 && `${rn}`}</span>
            </div>
          </td>
        ))}
      </tr>
      {expanded && children}
    </>
  );
};

export default memo(PlanningClassesTableRow);
