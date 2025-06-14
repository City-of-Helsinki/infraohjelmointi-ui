import { IClass, IClassBudgets, IClassFinances } from '@/interfaces/classInterfaces';
import {
  IPlanningCell,
  IPlanningSums,
  IProjectSums,
  PlanningRowType,
} from '@/interfaces/planningInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import { split } from 'lodash';

// Formats a number to include thousand sepparators
export const formatNumber = (number: number | undefined) => number?.toLocaleString('fi-FI') ?? '0';

// Turns a formatted number string to a number
export const formattedNumberToNumber = (formattedNumber?: string) => {
  if (!formattedNumber) {
    return 0;
  }
  // The character U+2212 is compared intentional here, since the number is formatted with toLocaleString('fi-FI')
  if (['−', '-'].includes(formattedNumber.trim()[0])) {
    return -parseInt(formattedNumber.trim().replace(/\D/g, ''));
  } else {
    return parseInt(formattedNumber.trim().replace(/\D/g, ''));
  }
};

/**
 * Calculates the budgets for the current row. Returns nothing for a division and no deviation for groups.
 *
 * @returns
 * - plannedBudgets: sum of all plannedBudgets (cells) for the current row
 * - costEstimateBudget: sum of all the frameBudgets and budgetOverrunAmount or the sum of project budgets if its a group
 * - deviation: deviation between costEstimateBudget and plannedBudgets and if the value is negative
 */
export const calculatePlanningRowSums = (
  finances: IClassFinances,
  type: PlanningRowType,
): IPlanningSums => {
  const { year, budgetOverrunAmount, projectBudgets, ...rest } = finances;

  const budgets = Object.values(rest).reduce(
    (budgets: { sumOfPlannedBudgets: number; sumOfFrameBudgets: number }, finance) => {
      budgets.sumOfPlannedBudgets += finance.plannedBudget;
      budgets.sumOfFrameBudgets += finance.frameBudget;
      return budgets;
    },
    { sumOfPlannedBudgets: 0, sumOfFrameBudgets: 0 },
  );

  const { sumOfPlannedBudgets, sumOfFrameBudgets } = budgets;

  const sumOfFramesAndOverrun = sumOfFrameBudgets + budgetOverrunAmount;
  const deviationBetweenCostEstimateAndBudget = sumOfFramesAndOverrun - sumOfPlannedBudgets;

  const plannedBudgets = formatNumber(sumOfPlannedBudgets);
  const costEstimateBudget = formatNumber(
    type === 'group' ? projectBudgets : sumOfFramesAndOverrun,
  );

  return {
    ...(type !== 'division' && {
      plannedBudgets,
      costEstimateBudget,
      ...(type !== 'group' && {
        deviation: formatNumber(deviationBetweenCostEstimateAndBudget),
      }),
    }),
  };
};

/**
 * Calculates the budgets for each cell for the current row. Return only the key for division and
 * no deviation for groups.
 *
 * @returns
 * - key: the key for the cell (key of the finance object)
 * - plannedBudget: sum of all underlying project finances for that year (calculated in the backend)
 * - frameBudget: the amount of frameBudget given to the underlying projects during that year
 * - deviation: the deviation between the plannedBudget and the framedBudget and if the value is negative
 */
export const calculatePlanningCells = (
  finances: IClassFinances,
  type: PlanningRowType,
): Array<IPlanningCell> => {
  const { year, budgetOverrunAmount, projectBudgets, ...rest } = finances;
  return Object.entries(rest).map(([key, value], i) => {
    const { frameBudget, plannedBudget, budgetChange, isFrameBudgetOverlap } = value;
    const deviation = frameBudget - plannedBudget;

    // Frame budget is always displayed along with the budgetChange
    const displayFrameBudget = budgetChange ? budgetChange + frameBudget : frameBudget;

    return {
      key,
      year: year + i,
      isCurrentYear: year + i === year,
      isFrameBudgetOverlap: isFrameBudgetOverlap,
      // we don't return any budgets for divisions
      ...(type !== 'division' && {
        plannedBudget: formatNumber(plannedBudget),
        // we don't return frameBudget or deviation for a group
        ...(type !== 'group' && {
          frameBudget: formatNumber(frameBudget),
          displayFrameBudget: formatNumber(displayFrameBudget),
          deviation: formatNumber(deviation),
          budgetChange: formatNumber(budgetChange),
        }),
      }),
    };
  });
};

/**
 * Takes an array of classes and sums together all their finances and create a list of planning cells with it.
 *
 * @returns
 * - key: the key for the cell (key of the finance object)
 * - plannedBudget: sum of all underlying project finances for that year (calculated in the backend)
 * - frameBudget: the amount of frameBudget given to the underlying projects during that year
 * - deviation: the deviation between the plannedBudget and the framedBudget and if the value is negative
 */
export const calculatePlanningSummaryCells = (
  classes: Array<IClass>,
  type: PlanningRowType,
): Array<IPlanningCell> => {
  const totalFinances = classes.reduce((totalFinances: IClassFinances, currentClass: IClass) => {
    const { budgetOverrunAmount, projectBudgets, year, ...rest } = currentClass.finances;

    Object.entries(rest).forEach(([key, value]) => {
      if (!Object.prototype.hasOwnProperty.call(totalFinances, key)) {
        Object.assign(totalFinances, {
          year,
          [key]: { frameBudget: value.frameBudget, plannedBudget: value.plannedBudget },
        });
      } else {
        const accBudgets = totalFinances[key as keyof IClassFinances] as IClassBudgets;
        const totalFrameBudget = (accBudgets.frameBudget += value.frameBudget);
        const totalPlannedBudget = (accBudgets.plannedBudget += value.plannedBudget);
        Object.assign(totalFinances, {
          [key]: {
            frameBudget: totalFrameBudget,
            plannedBudget: totalPlannedBudget,
          },
        });
      }
    });

    return totalFinances;
  }, {} as IClassFinances);

  return calculatePlanningCells(totalFinances, type);
};

/**
 * Calculates the budget sums for a project row and returns the sums.
 *
 * @returns
 * - costEstimateBudget: the sum of all the project finances (cells visible in the current year)
 * - availableFrameBudget: the deviation between the projects total budget and the already spent budget from past years
 */
export const calculateProjectRowSums = (project: IProject): IProjectSums => {
  const {
    costForecast,
    spentBudget,
    finances: { year, ...finances },
  } = project;

  const availableFrameBudget = Object.values(finances).reduce((accumulator, currentValue) => {
    if (currentValue !== null) {
      return accumulator + parseInt(currentValue);
    }
    return accumulator;
  }, 0);

  return {
    availableFrameBudget: formatNumber(availableFrameBudget),
    costEstimateBudget: formatNumber(parseInt(costForecast ?? '0') - parseInt(spentBudget)),
  };
};

export const calcPercentage = (value: number, total: number) => Math.round((value / total) * 100);

export const keurToMillion = (value?: string | null | number) => {
  if (!value) return '0,0';

  const valueAsNumber = typeof value !== 'number' ? formattedNumberToNumber(split(value, ".")[0]) : value;
  const millionValue = (valueAsNumber / 1000).toFixed(1);

  return millionValue.toString().replace('.', ',');
};

const roundUp = (number: number) => (number / 1000).toFixed(2);

// Specifically for budgetBookSummaryReport
export const convertToMillions = (value?: string | number): string => {
  if (!value) return '0.00';
  const valueWithCorrectType: number =
    typeof value === 'string' ? Number(value.replace(/\s/g, '')) : value;
  const rounded = roundUp(valueWithCorrectType);
  return String(rounded);
};

export const sumCosts = (costs: IProjectSapCost | undefined | null, costType1: string, costType2: string): number => {
  return costs ? (Number(costs[costType1 as keyof IProjectSapCost]) || 0) + (Number(costs[costType2 as keyof IProjectSapCost]) || 0) : 0;
}
