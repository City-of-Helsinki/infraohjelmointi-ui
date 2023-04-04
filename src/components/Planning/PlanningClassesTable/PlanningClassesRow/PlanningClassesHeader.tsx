import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { NameTooltip } from '../NameTooltip';
import { PlanningTableRowType } from '@/hooks/usePlanningTableRows';
import './styles.css';

interface IPlanningClassesHeaderProps {
  id: string;
  name: string;
  type: PlanningTableRowType;
  handleExpand: () => void;
  expanded?: boolean;
}

const PlanningClassesHeader: FC<IPlanningClassesHeaderProps> = ({
  id,
  name,
  type,
  handleExpand,
  expanded,
}) => {
  const { masterClassId, classId, subClassId } = useParams();

  // const hideDots = type === 'location' && hierarchy === ClassTableHierarchy.Second;
  const hideDots = false;

  const buildLink = useCallback(() => {
    const link = [masterClassId, classId, subClassId, id]
      .join('/')
      .replace(/(\/{2,})/gm, '/') // replace triple /// with one in case of one of values is undefined/null
      .replace(/(^\/)|(\/$)/gm, ''); // remove the last and first / in case of the last one of values is undefined/null

    return link;
  }, [id, masterClassId, classId]);

  return (
    <th className={`table-header ${type}`}>
      <div className="table-header-content">
        <Link to={buildLink()} className="display-flex" onClick={handleExpand}>
          {expanded ? <IconAngleUp /> : <IconAngleDown />}
        </Link>
        {/* Dots menu */}
        {!hideDots && (
          <div className={`table-header-content-dots`}>
            <IconMenuDots size="s" />
          </div>
        )}
        <div className="table-title-container">
          {/* <Span fontWeight={fontWeight} text={item.name} color={fontColor} /> */}
          <span className="table-header-title">{name}</span>
          {/* FIXME: Tooltip (visible if the header-content-item container is hovered) */}
          <NameTooltip value={name} />
        </div>
      </div>
    </th>
  );
};

export default memo(PlanningClassesHeader);
