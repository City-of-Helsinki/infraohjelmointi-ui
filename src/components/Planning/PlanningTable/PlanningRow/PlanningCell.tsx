import { ChangeEvent, FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import './styles.css';
import { patchCoordinationClass } from '@/services/classService';
import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import useOnClickOutsideRef from '@/hooks/useOnClickOutsideRef';
import { IconAlertCircle } from 'hds-react';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
  row: IPlanningRow;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell }) => {
  const { plannedBudget, frameBudget, deviation, year, isCurrentYear, isFrameBudgetOverlap } = cell;
  const mode = useAppSelector(selectPlanningMode);
  const [editFrameBudget, setEditFrameBudget] = useState(false);
  const selectedYear = useAppSelector(selectSelectedYear);
  const startYear = useAppSelector(selectStartYear);
  const forcedToFrame = useAppSelector(selectForcedToFrame);

  const [formFrameBudget, setFormFrameBudget] = useState<string | number | undefined>(
    parseInt(frameBudget ?? '0'),
  );

  const editFrameBudgetInputRef = useRef<HTMLInputElement>(null);

  const onEditFrameBudget = useCallback(() => {
    setEditFrameBudget((current) => !current);
  }, []);

  // Update frame budget when a new value is emitted
  useEffect(() => {
    setFormFrameBudget(parseInt(frameBudget ?? '0'));
  }, [frameBudget]);

  useOnClickOutsideRef(editFrameBudgetInputRef, onEditFrameBudget, editFrameBudget);

  // Removes the zero value on change if there is only one zero in the value
  const handleFrameBudgetChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // If the value is more than one zero set the form value normally
    if (/^0{2,}/.exec(e.target.value)) {
      setFormFrameBudget(e.target.value);
    }
    // If value is just a zero replace it
    else {
      setFormFrameBudget(e.target.value ? +e.target.value : 0);
    }
  }, []);

  const onPatchFrameBudget = () => {
    const request: IClassPatchRequest = {
      id,
      data: {
        finances: {
          year: startYear,
          [cell.key]: {
            frameBudget: formFrameBudget,
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
            data-testid="edit-framed-budget"
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
              value={formFrameBudget}
              onChange={handleFrameBudgetChange}
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
