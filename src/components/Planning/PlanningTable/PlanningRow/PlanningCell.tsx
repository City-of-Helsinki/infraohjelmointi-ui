import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/planningInterfaces';
import moment from 'moment';
import PlanningForecastSums from './PlanningForecastSums';
import { useAppSelector } from '@/hooks/common';
import {
  selectForcedToFrame,
  selectPlanningMode,
  selectSelectedYear,
} from '@/reducers/planningSlice';
import { removeHoveredClassFromMonth, setHoveredClassToMonth } from '@/utils/common';
import './styles.css';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell }) => {
  const { plannedBudget, frameBudget, deviation, year, isCurrentYear } = cell;
  const mode = useAppSelector(selectPlanningMode);
  const [editingFrameBudget, setEditingFrameBudget] = useState(false);
  const selectedYear = useAppSelector(selectSelectedYear);
  const forcedToFrame = useAppSelector(selectForcedToFrame);

  const editFrameBudgetInputRef = useRef<HTMLInputElement>(null);

  const onEditFrameBudget = useCallback(() => {
    setEditingFrameBudget((current) => !current);
  }, []);

  // Close frame budget input when clicking outside the input element
  useEffect(() => {
    if (!editFrameBudgetInputRef || !editFrameBudgetInputRef.current) {
      return;
    }

    const editFrameBudgetInputElement = editFrameBudgetInputRef?.current;

    const closeEditFrameBudget = (e: Event) => {
      if (editFrameBudgetInputElement && !editFrameBudgetInputElement.contains(e.target as Node)) {
        setEditingFrameBudget(false);
      }
    };

    document.addEventListener('mouseup', closeEditFrameBudget);

    return () => {
      document.removeEventListener('mouseup', closeEditFrameBudget);
    };
  }, [editFrameBudgetInputRef, editingFrameBudget]);

  return (
    <>
      <td
        className={`planning-cell ${type} ${forcedToFrame ? 'framed' : ''}`}
        data-testid={`cell-${id}-${year}`}
      >
        {!editingFrameBudget && (
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
                <span data-testid={`frame-budget-${id}-${year}`}>{frameBudget}</span>
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
        {editingFrameBudget && (
          <input
            id="edit-frame-budget-input"
            disabled={!editingFrameBudget}
            ref={editFrameBudgetInputRef}
            style={{ width: '100%', height: '80px' }}
          />
        )}
      </td>
      {/* There will be data generated here (at least for the first year) in future tasks */}
      {year === selectedYear && (
        <>
          {isCurrentYear && <PlanningForecastSums year={year} type={type} id={id} />}
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
