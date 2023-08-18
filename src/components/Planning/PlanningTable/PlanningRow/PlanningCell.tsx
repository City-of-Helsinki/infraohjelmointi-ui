import { FC, memo, useCallback, useMemo, useRef, useState } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/planningInterfaces';
import moment from 'moment';
import PlanningForecastSums from './PlanningForecastSums';
import { useAppSelector } from '@/hooks/common';
import {
  selectForcedToFrame,
  selectPlanningMode,
  selectSelectedYear,
  selectStartYear,
} from '@/reducers/planningSlice';
import { removeHoveredClassFromMonth, setHoveredClassToMonth } from '@/utils/common';
import { patchCoordinationClass } from '@/services/classService';
import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import useOnClickOutsideRef from '@/hooks/useOnClickOutsideRef';
import { IconAlertCircle } from 'hds-react';
import './styles.css';
import useNumberInput from '@/hooks/useNumberInput';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell }) => {
  const { plannedBudget, frameBudget, deviation, year, isCurrentYear, isFrameBudgetOverlap } = cell;
  const mode = useAppSelector(selectPlanningMode);
  const [editFrameBudget, setEditFrameBudget] = useState(false);
  const selectedYear = useAppSelector(selectSelectedYear);
  const startYear = useAppSelector(selectStartYear);
  const forcedToFrame = useAppSelector(selectForcedToFrame);

  const { value, onChange } = useNumberInput(frameBudget);

  const editFrameBudgetInputRef = useRef<HTMLInputElement>(null);

  const onEditFrameBudget = useCallback(() => {
    setEditFrameBudget((current) => !current);
  }, []);

  useOnClickOutsideRef(editFrameBudgetInputRef, onEditFrameBudget, editFrameBudget);

  const onPatchFrameBudget = () => {
    if (type === 'district' || type === 'districtPreview' || !id) {
      return;
    }

    const request: IClassPatchRequest = {
      id,
      data: {
        finances: {
          year: startYear,
          [cell.key]: {
            frameBudget: value,
          },
        },
      },
    };

    patchCoordinationClass(request);
  };

  const budgetOverlapAlertIcon = useMemo(
    () => isFrameBudgetOverlap && <IconAlertCircle className="budget-overlap-circle" />,
    [isFrameBudgetOverlap],
  );

  return (
    <>
      <td
        className={`planning-cell ${type} ${forcedToFrame ? 'framed' : ''}`}
        data-testid={`cell-${id}-${year}`}
      >
        {!editFrameBudget && (
          <button
            className="h-full w-full"
            disabled={mode !== 'coordination' || forcedToFrame}
            aria-label="edit framed budget"
            data-testid={`edit-framed-budget-${id}-${year}`}
            onClick={onEditFrameBudget}
          >
            <div className={`planning-cell-container`}>
              <>
                <span data-testid={`planned-budget-${id}-${year}`} className="planning-budget">
                  {plannedBudget}
                </span>
                <span
                  data-testid={`frame-budget-${id}-${year}`}
                  className={isFrameBudgetOverlap ? 'text-engel' : 'text-white'}
                >
                  {budgetOverlapAlertIcon}
                  {frameBudget}
                </span>
                <span
                  data-testid={`deviation-${id}-${year}`}
                  className={`planning-cell-deviation ${forcedToFrame ? 'framed' : ''}`}
                >
                  {deviation}
                </span>
              </>
            </div>
          </button>
        )}
        {editFrameBudget && (
          // height 0 prevents the table cell from growing
          <div className="frame-budget-container">
            <input
              id="edit-frame-budget-input"
              className="frame-budget-input"
              type="number"
              onBlur={onPatchFrameBudget}
              ref={editFrameBudgetInputRef}
              value={value}
              onChange={onChange}
            />
          </div>
        )}
      </td>
      {/* There will be data generated here (at least for the first year) in future tasks */}
      {year === selectedYear && (
        <>
          {isCurrentYear && <PlanningForecastSums cell={cell} id={id} type={type} />}
          {moment.months().map((m) => (
            <td
              key={m}
              className={`monthly-cell ${type} hoverable-${m} ${forcedToFrame ? 'framed' : ''}`}
              onMouseOver={() => setHoveredClassToMonth(m)}
              onMouseLeave={() => removeHoveredClassFromMonth(m)}
            />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningCell);
