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
import { patchCoordinationClass } from '@/services/classServices';
import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import useOnClickOutsideRef from '@/hooks/useOnClickOutsideRef';
import { IconAlertCircle } from 'hds-react';
import './styles.css';
import useNumberInput from '@/hooks/useNumberInput';
import { patchCoordinationLocation } from '@/services/locationServices';
import { selectUser } from '@/reducers/authSlice';
import { isUserCoordinator } from '@/utils/userRoleHelpers';
import { getGroupSapCosts } from '@/reducers/sapCostSlice';
import { selectUser } from '@/reducers/authSlice';
import { isUserCoordinator } from '@/utils/userRoleHelpers';
import { getGroupSapCosts } from '@/reducers/sapCostSlice';
import { selectUser } from '@/reducers/authSlice';
import { isUserCoordinator } from '@/utils/userRoleHelpers';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell }) => {
  const {
    plannedBudget,
    deviation,
    year,
    isCurrentYear,
    isFrameBudgetOverlap,
    displayFrameBudget,
    budgetChange,
  } = cell;

  const user = useAppSelector(selectUser);
  const mode = useAppSelector(selectPlanningMode);
  const [editFrameBudget, setEditFrameBudget] = useState(false);
  const selectedYear = useAppSelector(selectSelectedYear);
  const startYear = useAppSelector(selectStartYear);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const groupSapCosts = useAppSelector(getGroupSapCosts);

  const { value, onChange } = useNumberInput(displayFrameBudget);

  const editFrameBudgetInputRef = useRef<HTMLInputElement>(null);

  const onEditFrameBudget = useCallback(() => {
    setEditFrameBudget((current) => !current);
  }, []);

  useOnClickOutsideRef(editFrameBudgetInputRef, onEditFrameBudget, editFrameBudget);

  const onPatchFrameBudget = () => {
    // Don't patch anything the value is undefined or not changed
    if (
      !value ||
      !displayFrameBudget ||
      parseInt(displayFrameBudget.replace(/\s/g, '')) === parseInt(value)
    ) {
      return;
    }

    const budgetChangeNumber = budgetChange ? parseInt(budgetChange.replace(/\s/g, '')) : 0;
    const valueNumber = parseInt(value);

    // If the budget change is greater than the patched value we will only patch the input value
    // otherwise we patch the value - budget change
    const valueToPatch =
      valueNumber < budgetChangeNumber ? valueNumber : valueNumber - budgetChangeNumber;

    const request: IClassPatchRequest = {
      id,
      data: {
        finances: {
          year: startYear,
          [cell.key]: {
            frameBudget: valueToPatch,
          },
        },
      },
    };

    if (type === 'district' || type === 'districtPreview' || type === 'subLevelDistrict') {
      patchCoordinationLocation(request);
    } else {
      patchCoordinationClass(request);
    }
  };

  const budgetOverlapAlertIcon = useMemo(
    () => isFrameBudgetOverlap && <IconAlertCircle className="budget-overlap-circle" />,
    [isFrameBudgetOverlap],
  );

  const isEditFrameBudgetDisabled = useMemo(
    () => !isUserCoordinator(user) || mode !== 'coordination' || forcedToFrame,
    [forcedToFrame, mode, user],
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
            disabled={isEditFrameBudgetDisabled}
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
                  {displayFrameBudget}
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
          {isCurrentYear && (
            <PlanningForecastSums cell={cell} id={id} type={type} sapCosts={groupSapCosts} />
          )}
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
