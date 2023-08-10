import { useAppSelector } from '@/hooks/common';
import useOnClickOutsideRef from '@/hooks/useOnClickOutsideRef';
import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import { IPlanningCell, PlanningRowType } from '@/interfaces/planningInterfaces';
import { selectForcedToFrame, selectPlanningMode, selectStartYear } from '@/reducers/planningSlice';
import { patchCoordinationClass } from '@/services/classService';
import { ChangeEvent, FC, memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IPlanningForecastSums {
  type: PlanningRowType;
  id: string;
  cell: IPlanningCell;
}

/** The data displayed here will be provided from SAP */
const PlanningForecastSums: FC<IPlanningForecastSums> = ({ type, id, cell }) => {
  const { budgetChange, year } = cell;
  const { t } = useTranslation();
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const mode = useAppSelector(selectPlanningMode);
  const startYear = useAppSelector(selectStartYear);

  const [editBudgetChange, setEditBudgetChange] = useState(false);

  const [formBudgetChange, setFormBudgetChange] = useState<string | number | undefined>(
    parseInt(budgetChange ?? '0'),
  );
  const onEditBudgetChange = useCallback(() => setEditBudgetChange((current) => !current), []);
  const editBudgetChangeInputRef = useRef<HTMLInputElement>(null);

  useOnClickOutsideRef(editBudgetChangeInputRef, onEditBudgetChange, editBudgetChange);

  // Removes the zero value on change if there is only one zero in the value
  const handleBudgetChangeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // If the value is more than one zero set the form value normally
    if (/^0{2,}/.exec(e.target.value)) {
      setFormBudgetChange(e.target.value);
    }
    // If value is just a zero replace it
    else {
      setFormBudgetChange(e.target.value ? +e.target.value : 0);
    }
  }, []);

  const onPatchBudgetChange = () => {
    const request: IClassPatchRequest = {
      id,
      data: {
        finances: {
          year: startYear,
          [cell.key]: {
            budgetChange: formBudgetChange,
          },
        },
      },
    };
    patchCoordinationClass(request);
  };

  return (
    <td
      key={`${year}-monthly-cell`}
      className={`monthly-summary-cell ${type} ${forcedToFrame ? 'framed' : ''}`}
    >
      <button
        className={`planning-forecast-sums-container ${type}`}
        data-testid={`planning-forecast-sums-${id}`}
        disabled={mode !== 'coordination' || forcedToFrame || editBudgetChange}
        onClick={onEditBudgetChange}
        aria-label="edit budget change"
      >
        <div className={`planning-forecast-sums ${type} mt-[0.2rem]`}>
          <span className="!text-left">{t('implementedAndBound')}</span>
          <span className="!text-left">{t('deviationFromBudget')}</span>
          <span className="!text-left font-thin">{t('budgetChange')}</span>
        </div>
        {!editBudgetChange && (
          <div className={`planning-forecast-sums ${type} mt-[0.2rem]`}>
            <span data-testid={`planning-forecast-implemented-${id}`}>0</span>
            <span data-testid={`planning-forecast-bound-${id}`}>0</span>
            <span className="font-thin" data-testid={`budget-change-${id}`}>
              {budgetChange ?? '0'}
            </span>
          </div>
        )}
        {editBudgetChange && (
          <input
            id="edit-budget-change-input"
            className="budget-change-input"
            type="number"
            onBlur={onPatchBudgetChange}
            ref={editBudgetChangeInputRef}
            value={formBudgetChange}
            onChange={handleBudgetChangeChange}
          />
        )}
      </button>
    </td>
  );
};

export default memo(PlanningForecastSums);
