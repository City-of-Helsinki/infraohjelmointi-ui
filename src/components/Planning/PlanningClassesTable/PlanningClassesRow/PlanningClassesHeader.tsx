import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { NameTooltip } from '../NameTooltip';
import { PlanningTableRowType } from '@/hooks/usePlanningTableRows';
import './styles.css';

interface IPlanningClassesHeaderProps {
  id: string;
  name: string;
  type: PlanningTableRowType;
  handleExpand: () => void;
  expanded?: boolean;
  defaultExpanded: boolean;
}

const PlanningClassesHeader: FC<IPlanningClassesHeaderProps> = ({
  id,
  name,
  type,
  handleExpand,
  expanded,
}) => {
  const navigate = useNavigate();
  const { masterClassId, classId, subClassId } = useParams();

  const angleIcon = useMemo(() => (expanded ? <IconAngleUp /> : <IconAngleDown />), [expanded]);

  const link = useMemo(() => {
    return [masterClassId, classId, subClassId, id]
      .join('/')
      .replace(/(\/{2,})/gm, '/') // replace triple /// with one in case of one of values is undefined/null
      .replace(/(^\/)|(\/$)/gm, ''); // remove the last and first / in case of the last one of values is undefined/null
  }, [id, masterClassId, classId]);

  const onExpand = useCallback(() => {
    // Navigate to the next nested path if it's not a division or group
    if (type !== 'division' && type !== 'group') {
      navigate(link);
    }
    handleExpand();
  }, [link, navigate, type]);

  return (
    <th className={`table-header ${type}`}>
      <div className="table-header-content">
        <button className="display-flex" onClick={onExpand}>
          {angleIcon}
        </button>
        {type !== 'division' && (
          <div className={`table-header-content-dots`}>
            <IconMenuDots size="s" />
          </div>
        )}
        <button className="table-title-container" onClick={onExpand}>
          <span className="table-header-title">{name}</span>
          {/* FIXME: Tooltip (visible if the header-content-item container is hovered) */}
          <NameTooltip value={name} />
        </button>
      </div>
    </th>
  );
};

export default memo(PlanningClassesHeader);
