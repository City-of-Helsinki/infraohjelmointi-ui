import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { IconButton, Span } from '../../../shared';
import { FC, memo, useCallback } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { ClassTableHierarchy } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { NameTooltip } from '../NameTooltip';
import './styles.css';

interface IPlanningClassesHeaderProps {
  item: IClass | ILocation;
  hierarchy: ClassTableHierarchy;
  type: 'class' | 'location';
  handleExpand: () => void;
  expanded?: boolean;
}

const PlanningClassesHeader: FC<IPlanningClassesHeaderProps> = ({
  item,
  hierarchy,
  type,
  handleExpand,
  expanded,
}) => {
  const { masterClassId, classId } = useParams();

  const fontColor = type === 'class' ? 'white' : 'black';
  const fontWeight = type === 'class' ? 'bold' : 'medium';
  const hideDots = type === 'location' && hierarchy === ClassTableHierarchy.Second;

  const buildLink = useCallback(() => {
    return [masterClassId, classId, item.id]
      .join('/')
      .replace(/(\/\/)/gm, '/') // replace double // with one in case of one of values is undefined/null
      .replace(/(^\/)|(\/$)/gm, ''); // remove the last and first / in case of the last one of values is undefined/null
  }, [item.id, masterClassId, classId]);

  return (
    <th className={`table-header-cell ${type} ${hierarchy}`}>
      <div className={`table-header-content ${hierarchy}`}>
        <div className={`table-header-content-item`}>
          <Link to={buildLink()} className="display-flex">
            <IconButton
              icon={expanded ? IconAngleUp : IconAngleDown}
              color={fontColor}
              onClick={handleExpand}
            />
          </Link>
        </div>
        {/* Dots menu */}
        {!hideDots && (
          <div className={`table-header-content-dots`}>
            <IconMenuDots size="s" />
          </div>
        )}
        <div className={`table-header-content-item`}>
          <div className={`table-title-container`}>
            <Span fontWeight={fontWeight} text={item.name} color={fontColor} />
          </div>
          {/* Tooltip (visible if the header-content-item container is hovered) */}
          <NameTooltip value={item.name} />
        </div>
      </div>
    </th>
  );
};

export default memo(PlanningClassesHeader);
