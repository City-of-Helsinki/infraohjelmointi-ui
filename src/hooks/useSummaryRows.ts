import { IClass, IClassBudgets, IClassFinances } from '@/interfaces/classInterfaces';
import { IPlanningCell, IPlanningRowLists, IPlanningRowSelections } from '@/interfaces/common';
import { useEffect, useState } from 'react';
import { calculatePlanningCells } from './usePlanningRows';
import _ from 'lodash';

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

export const buildPlanningSummaryCells = (classes: Array<IClass>) => {
  const totalFinances = classes.reduce((acc: IClassFinances, curr: IClass) => {
    const { budgetOverrunAmount, projectBudgets, year, ...rest } = curr.finances;

    Object.entries(rest).forEach(([key, value]) => {
      if (!Object.prototype.hasOwnProperty.call(acc, key)) {
        Object.assign(acc, {
          [key]: { frameBudget: value.frameBudget, plannedBudget: value.plannedBudget },
        });
      } else {
        Object.assign(acc, {
          [key]: {
            frameBudget: ((acc[key as keyof IClassFinances] as IClassBudgets).frameBudget +=
              value.frameBudget),
            plannedBudget: ((acc[key as keyof IClassFinances] as IClassBudgets).plannedBudget +=
              value.plannedBudget),
          },
        });
      }
    });

    return acc;
  }, {} as IClassFinances);

  return calculatePlanningCells(totalFinances);
};

interface IUseSummaryRowsParams {
  startYear: number;
  selections: IPlanningRowSelections;
  lists: IPlanningRowLists;
}

/**
 * Listens to a startYear and a selectedMasterClass and returns rows for the PlanningSummaryTable.
 */
const useSummaryRows = ({ startYear, selections, lists }: IUseSummaryRowsParams) => {
  const { selectedMasterClass, selectedSubClass } = selections;
  const { masterClasses, classes } = lists;

  const [planningSummaryRows, setPlanningSummaryRows] = useState<IPlanningSummaryTableState>({
    header: [],
    cells: [],
  });

  // console.log(masterClasses);

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
    if (selectedSubClass) {
      setPlanningSummaryRows((current) => ({
        ...current,
        cells: buildPlanningSummaryCells(classes),
      }));
    } else {
      setPlanningSummaryRows((current) => ({
        ...current,
        cells: buildPlanningSummaryCells(masterClasses),
      }));
    }
  }, [selectedMasterClass, selectedSubClass, classes, masterClasses]);

  return planningSummaryRows;
};

export default useSummaryRows;
