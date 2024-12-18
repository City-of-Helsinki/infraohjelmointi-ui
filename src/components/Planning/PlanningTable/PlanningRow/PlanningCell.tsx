import { FC, memo, useCallback, useMemo, useRef, useState, Fragment } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/planningInterfaces';
import moment from 'moment';
import PlanningForecastSums from './PlanningForecastSums';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  selectForcedToFrame,
  selectNotes,
  selectPlanningMode,
  selectSelectedYear,
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
import { getGroupSapCosts, getGroupSapCurrentYear } from '@/reducers/sapCostSlice';
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
  const selectedYear = useAppSelector(selectSelectedYear);
  const startYear = useAppSelector(selectStartYear);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const groupSapCosts = useAppSelector(getGroupSapCosts);
  const groupSapCurrentYear = useAppSelector(getGroupSapCurrentYear);

  const { value, onChange, setInputValue } = useNumberInput(displayFrameBudget);
  const UPDATE_CELL_DATA = 'update-cell-data';

  const editFrameBudgetInputRef = useRef<HTMLInputElement>(null);

  const notes = useAppSelector(selectNotes);
 
  const matchingNotes = notes.filter((note) => (
      note.year === selectedYear && note.coordinatorClass === id
  ));

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
    if (parseInt(value) < 0){
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
        forcedToFrame: forcedToFrame
      },
    };

    if (type === 'district' || type === 'districtPreview' || type === 'subLevelDistrict') {
      patchCoordinationLocation(request).finally(() => {
        dispatch(clearLoading(UPDATE_CELL_DATA));
      })
    } else {
      patchCoordinationClass(request).finally(() => {
        dispatch(clearLoading(UPDATE_CELL_DATA));
      })
    }
  };

  const checkValue = () => {
    setInputValue(formattedNumberToNumber(displayFrameBudget));
  }

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
            <input autoFocus
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
      {year === selectedYear && (
        <>
          {isCurrentYear && <PlanningForecastSums cell={cell} id={id} type={type} sapCosts={groupSapCosts} />}
          {moment.months().map((m) => (
            pathname.includes('coordination') && m === 'tammikuu' ?
            <Fragment key={id}>
              <td
                key={id}
                className={`monthly-cell ${type} hoverable-${m} ${forcedToFrame ? 'framed' : ''}`}
                onMouseOver={() => setHoveredClassToMonth(m)}
                onFocus={() => setHoveredClassToMonth(m)}
                onMouseLeave={() => removeHoveredClassFromMonth(m)}
              >
                <button id="coordinator-note" onClick={() => {
                  dispatch(setNotesModalOpen({isOpen: true, id}));
                  dispatch(setNotesModalData({name, id}))
                }}>
                  { matchingNotes.length ? <IconSpeechbubbleText color="white" /> : <IconSpeechbubble color="white" /> }
                </button>
                <CoordinatorNotesModal id={id} type={type} selectedYear={selectedYear}/>
              </td>
            </Fragment>
            :
            <td
              key={m}
              className={`monthly-cell ${type} hoverable-${m} ${forcedToFrame ? 'framed' : ''}`}
              onMouseOver={() => setHoveredClassToMonth(m)}
              onFocus={() => setHoveredClassToMonth(m)}
              onMouseLeave={() => removeHoveredClassFromMonth(m)}
            />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningCell);
