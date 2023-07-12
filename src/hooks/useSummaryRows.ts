import { IPlanningCell } from '@/interfaces/planningInterfaces';
import { useEffect, useMemo, useState } from 'react';
import { calculatePlanningSummaryCells } from '@/utils/calculations';
import { useAppSelector } from './common';
import { selectBatchedPlanningClasses } from '@/reducers/classSlice';
import { selectSelections, selectStartYear } from '@/reducers/planningSlice';

interface IPlanningSummaryHeadCell {
  year: number;
  title: string;
  isCurrentYear: boolean;
}

interface IPlanningSummaryTableState {
  heads: Array<IPlanningSummaryHeadCell>;
  cells: Array<IPlanningCell>;
}

export const getPlanningRowTitle = (index: number) => {
  switch (index) {
    case 0:
      return 'kuluva TA';
    case 1:
      return 'TAE';
    case 2:
    case 3:
      return 'TSE';
    default:
      return 'alustava';
  }
};

/**
 * Creates 11 head-cells starting from the given startYear param.
 */
const buildPlanningSummaryHeadCells = (startYear: number) => {
  const cells = [];
  for (let i = 0; i < 11; i++) {
    cells.push({
      year: startYear + i,
      title: getPlanningRowTitle(i),
      isCurrentYear: startYear + i === startYear,
    });
  }
  return cells;
};

/**
 * Listens to a startYear and a selectedMasterClass and returns rows for the PlanningSummaryTable.
 */
const useSummaryRows = () => {
  const { selectedMasterClass, selectedSubClass, selectedClass } = useAppSelector(selectSelections);
  const allClasses = useAppSelector(selectBatchedPlanningClasses);
  const startYear = useAppSelector(selectStartYear);

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
