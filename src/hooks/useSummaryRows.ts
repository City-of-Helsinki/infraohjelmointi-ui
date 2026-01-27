import { IPlanningCell } from '@/interfaces/planningInterfaces';
import { useEffect, useMemo, useState } from 'react';
import { calculatePlanningSummaryCells } from '@/utils/calculations';
import { useAppSelector } from './common';
import {
  selectBatchedCoordinationClasses,
  selectBatchedPlanningClasses,
} from '@/reducers/classSlice';
import { selectPlanningMode, selectSelections, selectStartYear } from '@/reducers/planningSlice';

interface IPlanningSummaryHeadCell {
  year: number;
  title: string;
  isCurrentYear: boolean;
}

interface IPlanningSummaryTableState {
  heads: Array<IPlanningSummaryHeadCell>;
  cells: Array<IPlanningCell>;
}

export const getPlanningRowTitle = (startYear: number) => {
  const currentYear = new Date().getFullYear();
  const diff = startYear - currentYear;

  if (diff === 0) {
    return 'kuluva TA';
  } else if (diff === 1) {
    return 'TAE';
  } else if (diff < 0) {
    return 'TA';
  } else if (diff <= 3) {
    return 'TSE';
  } else {
    return 'alustava';
  }
};

/**
 * Creates 11 head-cells starting from the given startYear param.
 */
const buildPlanningSummaryHeadCells = (startYear: number) => {
  const cells = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 11; i++) {
    cells.push({
      year: startYear + i,
      title: getPlanningRowTitle(startYear + i),
      isCurrentYear: startYear + i === currentYear,
    });
  }
  return cells;
};

/**
 * Listens to a startYear and a selectedMasterClass and returns rows for the PlanningSummaryTable.
 */
const useSummaryRows = () => {
  const { selectedMasterClass, selectedSubClass, selectedClass } = useAppSelector(selectSelections);
  const allPlanningClasses = useAppSelector(selectBatchedPlanningClasses);
  const allCoordinationClasses = useAppSelector(selectBatchedCoordinationClasses);
  const mode = useAppSelector(selectPlanningMode);
  const startYear = useAppSelector(selectStartYear);

  const allClasses = useMemo(
    () => (mode === 'coordination' ? allCoordinationClasses : allPlanningClasses),
    [mode, allCoordinationClasses, allPlanningClasses],
  );

  const masterClasses = useMemo(
    () => (selectedMasterClass ? [selectedMasterClass] : allClasses.masterClasses),
    [allClasses.masterClasses, selectedMasterClass],
  );

  const classes = useMemo(
    () => (selectedClass ? [selectedClass] : allClasses.subClasses),
    [allClasses.subClasses, selectedClass],
  );

  const [planningSummaryRows, setPlanningSummaryRows] = useState<IPlanningSummaryTableState>({
    heads: [],
    cells: [],
  });

  // Listens to a startYear and creates 11 cells starting with the startYear
  useEffect(() => {
    if (startYear) {
      setPlanningSummaryRows((current) => ({
        ...current,
        heads: buildPlanningSummaryHeadCells(startYear),
      }));
    }
  }, [startYear]);

  /**
   * Listens to the selectedMasterClass and selectedSubClass and populates the cells with budgets.
   *
   * - if no there is no selectedMasterClass all masterClass budgets will be summed and populated
   * - if there is a selectedMasterClass then that masterClasses budgets will be populated
   * - if there is a selectedSubClass then its parentClass will be populated
   */
  useEffect(() => {
    if (selectedSubClass) {
      setPlanningSummaryRows((current) => ({
        ...current,
        cells: calculatePlanningSummaryCells(classes, 'class'),
      }));
    } else {
      setPlanningSummaryRows((current) => ({
        ...current,
        cells: calculatePlanningSummaryCells(masterClasses, 'masterClass'),
      }));
    }
  }, [selectedMasterClass, selectedSubClass, classes, masterClasses]);

  return planningSummaryRows;
};

export default useSummaryRows;
