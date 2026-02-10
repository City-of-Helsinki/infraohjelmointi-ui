import { FC, memo, useCallback, useMemo, useRef, useState } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/planningInterfaces';
import moment from 'moment';
import PlanningForecastSums from './PlanningForecastSums';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  selectForcedToFrame,
  selectNotes,
  selectNotesModalOpen,
  selectPlanningMode,
  selectSelectedYears,
  selectStartYear,
  setNotesModalData,
  setNotesModalOpen,
} from '@/reducers/planningSlice';
import { removeHoveredClassFromMonth, setHoveredClassToMonth } from '@/utils/common';
import { patchCoordinationClass } from '@/services/classServices';
import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import useOnClickOutsideRef from '@/hooks/useOnClickOutsideRef';
import './styles.css';
import useNumberInput from '@/hooks/useNumberInput';
import { patchCoordinationLocation } from '@/services/locationServices';
import { selectUser } from '@/reducers/authSlice';
import { isUserCoordinator } from '@/utils/userRoleHelpers';
import { formattedNumberToNumber } from '@/utils/calculations';
import { getGroupSapCurrentYear } from '@/reducers/sapCostSlice';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';

import { CoordinatorNotesModal } from '@/components/CoordinatorNotesModal';
import { IconAlertCircle, IconSpeechbubble, IconSpeechbubbleText } from 'hds-react';
import { useLocation } from 'react-router';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell, name }) => {
  const dispatch = useAppDispatch();
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
  const { pathname } = useLocation();
  const mode = useAppSelector(selectPlanningMode);
  const [editFrameBudget, setEditFrameBudget] = useState(false);
  const selectedYears = useAppSelector(selectSelectedYears);
  const startYear = useAppSelector(selectStartYear);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const groupSapCurrentYear = useAppSelector(getGroupSapCurrentYear);

  const { value, onChange, setInputValue } = useNumberInput(displayFrameBudget);
  const UPDATE_CELL_DATA = 'update-cell-data';

  const editFrameBudgetInputRef = useRef<HTMLInputElement>(null);

  const notes = useAppSelector(selectNotes);
  const notesModalOpen = useAppSelector(selectNotesModalOpen);

  const matchingNotes = notes.filter((note) => note.year === year && note.coordinatorClass === id);

  const toggleCoordinatorNotesModal = useCallback(() => {
    const isCurrentModalOpen =
      notesModalOpen.isOpen && notesModalOpen.id === id && notesModalOpen.selectedYear === year;

    if (isCurrentModalOpen) {
      dispatch(setNotesModalOpen({ isOpen: false, id: '', selectedYear: null }));
      return;
    }

    dispatch(setNotesModalOpen({ isOpen: true, id, selectedYear: year }));
    dispatch(setNotesModalData({ name, id }));
  }, [dispatch, id, name, notesModalOpen, year]);

  const onEditFrameBudget = useCallback(() => {
    setEditFrameBudget((current) => !current);
  }, []);

  useOnClickOutsideRef(editFrameBudgetInputRef, onEditFrameBudget, editFrameBudget);

  const onPatchFrameBudget = () => {
    // Don't patch anything the value is undefined or not changed
    if (
      !value ||
      !displayFrameBudget ||
      formattedNumberToNumber(displayFrameBudget) === parseInt(value)
    ) {
      return;
    }

    // If negative value, do not send request
    if (parseInt(value) < 0) {
      return;
    }

    dispatch(
      setLoading({
        text: 'Update data',
        id: UPDATE_CELL_DATA,
      }),
    );

    const budgetChangeNumber = budgetChange ? formattedNumberToNumber(budgetChange) : 0;
    const valueNumber = formattedNumberToNumber(value);

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
        forcedToFrame: forcedToFrame,
      },
    };

    if (type === 'district' || type === 'districtPreview' || type === 'subLevelDistrict') {
      patchCoordinationLocation(request).finally(() => {
        dispatch(clearLoading(UPDATE_CELL_DATA));
      });
    } else {
      patchCoordinationClass(request).finally(() => {
        dispatch(clearLoading(UPDATE_CELL_DATA));
      });
    }
  };

  const checkValue = () => {
    setInputValue(formattedNumberToNumber(displayFrameBudget));
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
                  id={`frame-budget-${id}-${year}`}
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
              autoFocus
              id="edit-frame-budget-input"
              className="frame-budget-input"
              type="number"
              onBlur={onPatchFrameBudget}
              ref={editFrameBudgetInputRef}
              value={value}
              onChange={onChange}
              onFocus={checkValue}
            />
          </div>
        )}
      </td>
      {/* There will be data generated here (at least for the first year) in future tasks */}
      {selectedYears.includes(year) && (
        <>
          {isCurrentYear && (
            <PlanningForecastSums cell={cell} id={id} type={type} sapCosts={groupSapCurrentYear} />
          )}
          {moment.months().map((m) => {
            const hoverKey = `${year}-${m}`;
            if (pathname.includes('coordination') && m === 'tammikuu') {
              return (
                <td
                  key={`coordination-${id}-${m}`}
                  className={`monthly-cell ${type} hoverable-${hoverKey} ${
                    forcedToFrame ? 'framed' : ''
                  }`}
                  onMouseOver={() => setHoveredClassToMonth(hoverKey)}
                  onFocus={() => setHoveredClassToMonth(hoverKey)}
                  onMouseLeave={() => removeHoveredClassFromMonth(hoverKey)}
                >
                  <button id="coordinator-note" onClick={toggleCoordinatorNotesModal}>
                    {matchingNotes.length ? (
                      <IconSpeechbubbleText color="white" />
                    ) : (
                      <IconSpeechbubble color="white" />
                    )}
                  </button>
                  <CoordinatorNotesModal id={id} type={type} selectedYear={year} />
                </td>
              );
            }
            return (
              <td
                key={`${year}-${id}-${m}`}
                className={`monthly-cell ${type} hoverable-${hoverKey} ${
                  forcedToFrame ? 'framed' : ''
                }`}
                onMouseOver={() => setHoveredClassToMonth(hoverKey)}
                onFocus={() => setHoveredClassToMonth(hoverKey)}
                onMouseLeave={() => removeHoveredClassFromMonth(hoverKey)}
              />
            );
          })}
        </>
      )}
    </>
  );
};

export default memo(PlanningCell);
