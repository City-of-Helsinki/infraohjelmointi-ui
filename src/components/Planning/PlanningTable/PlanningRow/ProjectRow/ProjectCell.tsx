import {
  IProjectCell,
  IProjectFinances,
  IProjectRequest,
  ProjectCellGrowDirection,
} from '@/interfaces/projectInterfaces';
import { patchProject } from '@/services/projectServices';
import { dispatchContextMenuEvent } from '@/utils/events';
import {
  ChangeEvent,
  FC,
  useCallback,
  useState,
  MouseEvent,
  useEffect,
  memo,
  useRef,
  useMemo,
} from 'react';
import EditTimelineButton from './EditTimelineButton';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import ProjectYearSummary from './ProjectYearSummary/ProjectYearSummary';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  selectForcedToFrame,
  selectSelectedYear,
  selectSelections,
} from '@/reducers/planningSlice';
import {
  getCellTypeUpdateRequestData,
  getRemoveRequestData,
  getAddRequestData,
  getMoveTimelineRequestData,
  addActiveClassToProjectRow,
  convertToForcedToFrameProjectRequest,
} from './projectCellUtils';
import { notifyError } from '@/reducers/notificationSlice';
import { selectUser } from '@/reducers/authSlice';
import { isUserOnlyProjectAreaPlanner, isUserOnlyViewer } from '@/utils/userRoleHelpers';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';

interface IProjectCellProps {
  cell: IProjectCell;
  projectFinances: IProjectFinances | null;
  sapProject: string | undefined;
  sapCosts: Record<string, IProjectSapCost>;
  sapCurrentYear: Record<string, IProjectSapCost>;
}

interface IProjectCellState {
  isReadOnly: boolean;
  formValue: number | null | string;
}

const ProjectCell: FC<IProjectCellProps> = ({ cell, projectFinances, sapProject, sapCurrentYear }) => {
  const { budget, type, financeKey, year, growDirections, id, title, startYear } = cell;
  const dispatch = useAppDispatch();
  const cellRef = useRef<HTMLTableCellElement>(null);
  const selectedYear = useAppSelector(selectSelectedYear);
  const forcedToFrame = useAppSelector(selectForcedToFrame);

  const UPDATE_CELL_DATA = 'update-cell-data';

  const user = useAppSelector(selectUser);
  const selectedMasterClass = useAppSelector(selectSelections).selectedMasterClass;

  const [projectCellState, setProjectCellState] = useState<IProjectCellState>({
    isReadOnly: true,
    formValue: parseInt(budget ?? '0'),
  });

  const { formValue, isReadOnly } = projectCellState;

  // Values of cells that have the none type will be empty strings to hide them
  const formDisplayValue = useMemo(
    () => (type !== 'none' ? formValue?.toString() : ''),
    [formValue, type],
  );

  const inputDisabled = useMemo(() => {
    if (type === 'none') {
      return true;
    }

    // Project area planner can only edit projects under masterclass 808
    if (isUserOnlyProjectAreaPlanner(user)) {
      return !(
        selectedMasterClass?.name.startsWith('808') || selectedMasterClass?.name.startsWith('8 08')
      );
    }

    // Disable editing project budgets if user is only a viewer
    return isUserOnlyViewer(user);
  }, [type, user, selectedMasterClass]);

  const updateCell = useCallback(
    (req: IProjectRequest) => {
      dispatch(
        setLoading({
          text: 'Update data',
          id: UPDATE_CELL_DATA,
        }),
      );

      if (forcedToFrame) {
        convertToForcedToFrameProjectRequest(req);
      }

      patchProject({
        id,
        data: req,
      }).catch(() => {
        dispatch(notifyError({ message: 'financeChangeError', title: 'patchError' }));
      }).finally(() => {
        dispatch(clearLoading(UPDATE_CELL_DATA));;
      });
    },
    [forcedToFrame, id, dispatch],
  );

  const canTypeUpdate = useCallback(() => {
    return (
      (cell.type === 'planningEnd' ||
        cell.type === 'constructionStart' ||
        cell.type === 'overlap') &&
      !cell.isLastOfType
    );
  }, [cell]);

  const onUpdateCellType = useCallback(
    (type: string) => {
      updateCell(getCellTypeUpdateRequestData(cell, type));
    },
    [cell, updateCell],
  );

  // Focusing the input field will activate the input field by switching its readOnly property
  const handleFocus = useCallback(() => {
    setProjectCellState((current) => ({ ...current, isReadOnly: !current.isReadOnly }));
  }, []);

  // Removes the zero value on change if there is only one zero in the value
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // If the value is more than one zero set the form value normally
    if (/^0{2,}/.exec(e.target.value)) {
      setProjectCellState((current) => ({ ...current, formValue: e.target.value }));
    }
    // If value is just a zero replace it
    else {
      setProjectCellState((current) => ({
        ...current,
        formValue: e.target.value ? +e.target.value : 0,
      }));
    }
  }, []);

  // Blurring the input field will patch the current budget
  const handleBlur = useCallback((): void => {
    setProjectCellState((current) => ({ ...current, isReadOnly: !current.isReadOnly }));
    if (formValue !== parseInt(budget ?? '0')) {
      updateCell({
        finances: {
          year: startYear,
          [financeKey]: formValue,
        },
      });
    }
  }, [formValue, budget, updateCell, startYear, financeKey]);

  const onRemoveCell = useCallback(() => {
    updateCell(getRemoveRequestData(cell));
  }, [updateCell, cell]);

  const onAddYear = useCallback(
    (direction: ProjectCellGrowDirection) => {
      updateCell(getAddRequestData(direction, cell));
    },
    [updateCell, cell],
  );

  const onMoveTimeline = useCallback(
    (direction: ProjectCellGrowDirection) => {
      const { isStartOfTimeline, isEndOfTimeline } = cell;
      if ((isStartOfTimeline || isEndOfTimeline) && projectFinances) {
        updateCell(getMoveTimelineRequestData(cell, direction, projectFinances));
      }
    },
    [cell, updateCell, projectFinances],
  );

  // Set the active css-class to the current row using the project id, this will render the edit-buttons and borders
  const onEditCell = useCallback(() => {
    addActiveClassToProjectRow(id);
  }, [id]);

  // Convert any cell type to 'planning' / 'construction' / 'overlap' / 'none'
  const cellTypeClass = useMemo(() => {
    if (type.includes('planning')) {
      return 'planning';
    } else if (type.includes('construction')) {
      return 'construction';
    } else {
      return type;
    }
  }, [type]);

  //
  const selectedYearClass = useMemo(
    () => (year === selectedYear ? 'selected-year' : ''),
    [selectedYear, year],
  );

  const currentYearClass = useMemo(
    () => (year === startYear ? 'current-year' : ''),
    [year, startYear],
  );

  // Open the custom context menu when right-clicking a cell
  const handleOpenContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      dispatchContextMenuEvent(e, {
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
        cellMenuProps: {
          year,
          title,
          cellType: cellTypeClass,
          onRemoveCell,
          onEditCell,
          onUpdateCellType,
          canTypeUpdate: canTypeUpdate(),
        },
      });
    },
    [onRemoveCell, onEditCell, cellTypeClass, year, title, onUpdateCellType, canTypeUpdate],
  );

  // Set the budgets value to a number if it exists
  useEffect(() => {
    setProjectCellState((current) => ({ ...current, formValue: parseInt(budget ?? '0') }));
  }, [budget]);

  // Sets isSelectedYear to true if the current cell is the selectedYear
  useEffect(() => {
    setProjectCellState((current) => ({ ...current, isSelectedYear: selectedYear === year }));
  }, [selectedYear, year]);

  return (
    <>
      <td
        ref={cellRef}
        className={`project-cell ${cellTypeClass} ${selectedYearClass} ${currentYearClass}`}
        onContextMenu={type !== 'none' ? handleOpenContextMenu : undefined}
        data-testid={`project-cell-${year}-${id}`}
      >
        <div className="project-cell-input-wrapper">
          <div className="project-cell-input-container">
            <input
              value={formDisplayValue}
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              disabled={inputDisabled}
              readOnly={isReadOnly}
              className="project-cell-input"
              data-testid={`cell-input-${year}-${id}`}
              id={`cell-input-${year}-${id}`}
            />
          </div>
        </div>
        {type !== 'none' &&
          growDirections.map((d) => (
            <EditTimelineButton
              key={d}
              direction={d}
              id={`${year}-${id}`}
              onSingleClick={onAddYear}
              onDoubleClick={onMoveTimeline}
            />
          ))}
      </td>
      {selectedYearClass && (
        <ProjectYearSummary cellType={cellTypeClass} {...cell} sapProject={sapProject} sapCurrentYear={sapCurrentYear} />
      )}
    </>
  );
};

export default memo(ProjectCell);
