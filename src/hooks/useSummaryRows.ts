import { IClass } from '@/interfaces/classInterfaces';
import { IPlanningCell } from '@/interfaces/common';
import { useEffect, useState } from 'react';
import { calculatePlanningCells } from './usePlanningRows';

const initialCell: IPlanningCell = {
  key: 'year0',
  deviation: { value: '', isNegative: false },
  plannedBudget: '',
  frameBudget: '',
};

export const initialCells: Array<IPlanningCell> = [
  { ...initialCell },
  { ...initialCell, key: 'year1' },
  { ...initialCell, key: 'year2' },
  { ...initialCell, key: 'year3' },
  { ...initialCell, key: 'year4' },
  { ...initialCell, key: 'year5' },
  { ...initialCell, key: 'year6' },
  { ...initialCell, key: 'year7' },
  { ...initialCell, key: 'year8' },
  { ...initialCell, key: 'year9' },
  { ...initialCell, key: 'year10' },
];

interface IPlanningSummaryHeaderCell {
  year: number;
  title: string;
}

interface IPlanningSummaryTableState {
  header: Array<IPlanningSummaryHeaderCell>;
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

const buildPlanningSummaryHeaderRow = (startYear: number) => {
  const header: Array<IPlanningSummaryHeaderCell> = [];
  for (let i = 0; i < 11; i++) {
    header.push({ year: startYear + i, title: getPlanningRowTitle(i) });
  }
  return { header };
};

const buildPlanningSummaryCells = (selectedMasterClass: IClass | null) => ({
  cells: selectedMasterClass ? calculatePlanningCells(selectedMasterClass.finances) : initialCells,
});

interface IUseSummarRowsParams {
  startYear: number;
  selectedMasterClass: IClass | null;
}

/**
 * Listens to a startYear and a selectedMasterClass and returns rows for the PlanningSummaryTable.
 */
const useSummaryRows = ({ startYear, selectedMasterClass }: IUseSummarRowsParams) => {
  const [planningSummaryRows, setPlanningSummaryRows] = useState<IPlanningSummaryTableState>({
    header: [],
    cells: initialCells,
  });

  // Listens to a startYear and creates 11 cells starting with the startYear
  useEffect(() => {
    if (startYear) {
      setPlanningSummaryRows((current) => ({
        ...current,
        ...buildPlanningSummaryHeaderRow(startYear),
      }));
    }
  }, [startYear]);

  // Listens to the selectedMasterClass and either populates the cells with the masterClasses data or empty
  useEffect(() => {
    setPlanningSummaryRows((current) => ({
      ...current,
      ...buildPlanningSummaryCells(selectedMasterClass),
    }));
  }, [selectedMasterClass]);

  return planningSummaryRows;
};

export default useSummaryRows;
