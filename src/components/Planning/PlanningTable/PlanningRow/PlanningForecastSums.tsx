import { useAppDispatch, useAppSelector } from '@/hooks/common';
import useNumberInput from '@/hooks/useNumberInput';
import useOnClickOutsideRef from '@/hooks/useOnClickOutsideRef';
import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import { IPlanningCell, PlanningRowType } from '@/interfaces/planningInterfaces';
import { IGroupSapCost } from '@/interfaces/sapCostsInterfaces';
import { selectUser } from '@/reducers/authSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { selectForcedToFrame, selectPlanningMode, selectStartYear } from '@/reducers/planningSlice';
import { patchCoordinationClass } from '@/services/classServices';
import { isUserCoordinator } from '@/utils/userRoleHelpers';
import { formattedNumberToNumber } from '@/utils/calculations';
import { FC, memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IPlanningForecastSums {
  type: PlanningRowType;
  id: string;
  cell: IPlanningCell;
  sapCosts: Record<string, IGroupSapCost>;
}

/** The data displayed here will be provided from SAP */
const PlanningForecastSums: FC<IPlanningForecastSums> = ({ type, id, cell, sapCosts }) => {
  const { budgetChange, year } = cell;
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectPlanningMode);
  const startYear = useAppSelector(selectStartYear);
  const editBudgetChangeInputRef = useRef<HTMLInputElement>(null);

  const [editBudgetChange, setEditBudgetChange] = useState(false);

  const { value, onChange, setInputValue } = useNumberInput(budgetChange);

  const onEditBudgetChange = useCallback(() => setEditBudgetChange((current) => !current), []);

  const displayBudgetChange = useMemo(
    () => mode === 'coordination' && type !== 'group',
    [mode, type],
  );

  const forecastCostsForGroups = useMemo(() => {
    const groupSapCosts = sapCosts[id];
    if (!groupSapCosts) {
      return 0;
    }

    return Number(
      Number(groupSapCosts.group_combined_commitments) + Number(groupSapCosts.group_combined_costs),
    ).toFixed(2);
  }, [type, id, cell]);

  useOnClickOutsideRef(editBudgetChangeInputRef, onEditBudgetChange, editBudgetChange);

  const onPatchBudgetChange = () => {
    // Don't send request including empty budgetChange info
    if (!value) {
      return;
    }

    const frameBudgetElement = document.getElementById(`frame-budget-${id}-${year}`);
    const frameBudget = formattedNumberToNumber(frameBudgetElement?.innerHTML || '0');
    const parsedValue = formattedNumberToNumber(value || '0');
    
    // We don't want the frame budget to be a negative value
    if (frameBudget - formattedNumberToNumber(budgetChange || '0') + parsedValue < 0) {
      dispatch(
        notifyError({
          message: 'frameBudgetError',
          title: 'saveError',
          type: 'toast',
          duration: 5000,
        }),
      );
      return;
    }

    const request: IClassPatchRequest = {
      id,
      data: {
        finances: {
          year: startYear,
          [cell.key]: {
            budgetChange: parsedValue,
          },
        },
        forcedToFrame: forcedToFrame
      },
    };
    patchCoordinationClass(request);
  };

  const checkValue = () => {
    if((!value && editBudgetChange) || budgetChange != value){
      setInputValue(formattedNumberToNumber(budgetChange));
    }
  }

  const isEditBudgetChangeDisabled = useMemo(
    () => !isUserCoordinator(user) || mode !== 'coordination' || forcedToFrame || editBudgetChange,
    [forcedToFrame, mode, user, editBudgetChange],
  );

  return (
    <td
      key={`${year}-monthly-cell`}
      className={`monthly-summary-cell ${type} ${forcedToFrame ? 'framed' : ''}`}
    >
      <button
        className={`planning-forecast-sums-container ${type}`}
        data-testid={`planning-forecast-sums-${id}`}
        disabled={isEditBudgetChangeDisabled}
        onClick={onEditBudgetChange}
        aria-label="edit budget change"
      >
        <div className={`planning-forecast-sums ${type} mt-[0.2rem]`}>
          <span className="!text-left">{t('implementedAndBound')}</span>
          <span className="!text-left">{t('deviationFromBudget')}</span>
          {displayBudgetChange && <span className="!text-left font-thin">{t('budgetChange')}</span>}
        </div>
        {!editBudgetChange && (
          <div className={`planning-forecast-sums ${type} mt-[0.2rem]`}>
            <span data-testid={`planning-forecast-implemented-${id}`}>
              {Number(forecastCostsForGroups).toFixed(0)}
            </span>
            <span data-testid={`planning-forecast-bound-${id}`}>0</span>
            {displayBudgetChange && (
              <span className="font-thin" data-testid={`budget-change-${id}`}>
                {budgetChange ?? '0'}
              </span>
            )}
          </div>
        )}
        {editBudgetChange && (
          <input autoFocus
            id="edit-budget-change-input"
            className="budget-change-input"
            type="number"
            onBlur={onPatchBudgetChange}
            ref={editBudgetChangeInputRef}
            value={value}
            onChange={onChange}
            onFocus={checkValue}
          />
        )}
      </button>
    </td>
  );
};

export default memo(PlanningForecastSums);
