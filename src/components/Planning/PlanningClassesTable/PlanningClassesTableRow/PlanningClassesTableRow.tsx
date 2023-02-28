import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { BubbleIcon, IconButton } from '../../../shared';
import { FC, memo, ReactNode, useCallback, useEffect, useState } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { classSums } from '@/mocks/common';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { ClassTableHierarchy } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { NameTooltip } from '../NameTooltip';
import './styles.css';
import PlanningClassesCell from './PlanningClassesCell';

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

  const textColor = type === 'class' ? 'white' : 'black';
  const showDots = type !== 'location' && hierarchy !== ClassTableHierarchy.Second;

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
          <div className={`table-header-content ${hierarchy}`}>
            <div className={`table-header-content-item`}>
              <Link to={buildLink()} className="display-flex">
                <IconButton
                  icon={expanded ? IconAngleUp : IconAngleDown}
                  color={textColor}
                  onClick={handleExpanded}
                />
              </Link>
            </div>
            {/* Dots menu */}
            {showDots && (
              <div className={`table-header-content-dots`}>
                <IconMenuDots size="xs" />
              </div>
            )}
            <div className={`table-header-content-item`}>
              <div className={`table-title-container`}>
                {/* <Span
                  fontWeight={type === 'class' ? 'bold' : 'medium'}
                  text={item.name}
                  color={textColor}
                /> */}
                <span>{item.name}</span>
              </div>
              {/* Tooltip (visible if the header-content-item container is hovered) */}
              <NameTooltip value={item.name} />
            </div>
          </div>
        </th>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {classSums.map((cs: any, i: number) => (
          <PlanningClassesCell key={i} sum={cs} position={i} hierarchy={hierarchy} type={type} />
        ))}
      </tr>
      {expanded && children}
    </>
  );
};

export default memo(PlanningClassesTableRow);
