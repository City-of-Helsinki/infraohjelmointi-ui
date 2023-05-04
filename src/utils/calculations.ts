import { IClass, IClassBudgets, IClassFinances } from '@/interfaces/classInterfaces';
import { IPlanningCell, IPlanningSums, PlanningRowType } from '@/interfaces/common';

export const formatNumber = (number: number | undefined) =>
  number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') ?? '0';

/**
 * Calculates the budgets for the current row.
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

  const sumOfPlannedBudgets = Object.values(rest).reduce((accumulator, currentValue) => {
    if (currentValue?.plannedBudget) {
      return accumulator + currentValue.plannedBudget;
    }
    return accumulator;
  }, 0);

  const sumOfFrameBudgets = Object.values(rest).reduce((accumulator, currentValue) => {
    if (currentValue?.frameBudget) {
      return accumulator + currentValue.frameBudget;
    }
    return accumulator;
  }, 0);

  const sumOfFramesAndOverrun = sumOfFrameBudgets + budgetOverrunAmount;
  const deviationBetweenCostEstimateAndBudget = sumOfFramesAndOverrun - sumOfPlannedBudgets;

  const plannedBudgets = formatNumber(sumOfPlannedBudgets);
  const costEstimateBudget = formatNumber(
    type === 'group' ? projectBudgets : sumOfFramesAndOverrun,
  );

  return {
    plannedBudgets,
    costEstimateBudget,
    ...(type !== 'group' && {
      deviation: {
        value: formatNumber(deviationBetweenCostEstimateAndBudget),
        isNegative: deviationBetweenCostEstimateAndBudget < 0,
      },
    }),
  };
};

/**
 * Calculates the budgets for each cell for the current row. The first cell will get additional properties.
 *
 * @returns
 * - key: the key for the cell (key of the finance object)
 * - plannedBudget: sum of all underlying project finances for that year (calculated in the backend)
 * - frameBudget: the amount of frameBudget given to the underlying projects during that year
 * - deviation: the deviation between the plannedBudget and the framedBudget and if the value is negative
 */
export const calculatePlanningCells = (finances: IClassFinances): Array<IPlanningCell> => {
  const { year, budgetOverrunAmount, projectBudgets, ...rest } = finances;
  return Object.entries(rest).map(([key, value]) => {
    const { frameBudget, plannedBudget } = value;

    const deviation = frameBudget - plannedBudget;

    return {
      key,
      plannedBudget: formatNumber(plannedBudget),
      frameBudget: formatNumber(frameBudget),
      deviation: {
        value: formatNumber(deviation),
        isNegative: deviation < 0,
      },
    };
  });
};

/**
 * Takes an array of classes and sums together all their finances into a list of IPlanningCells
 *
 * @returns
 * - key: the key for the cell (key of the finance object)
 * - plannedBudget: sum of all underlying project finances for that year (calculated in the backend)
 * - frameBudget: the amount of frameBudget given to the underlying projects during that year
 * - deviation: the deviation between the plannedBudget and the framedBudget and if the value is negative
 */
export const calculatePlanningSummaryCells = (classes: Array<IClass>): Array<IPlanningCell> => {
  const totalFinances = classes.reduce((acc: IClassFinances, curr: IClass) => {
    const { budgetOverrunAmount, projectBudgets, year, ...rest } = curr.finances;

    Object.entries(rest).forEach(([key, value]) => {
      if (!Object.prototype.hasOwnProperty.call(acc, key)) {
        Object.assign(acc, {
          [key]: { frameBudget: value.frameBudget, plannedBudget: value.plannedBudget },
        });
      } else {
        const accBudgets = acc[key as keyof IClassFinances] as IClassBudgets;
        Object.assign(acc, {
          [key]: {
            frameBudget: (accBudgets.frameBudget += value.frameBudget),
            plannedBudget: (accBudgets.plannedBudget += value.plannedBudget),
          },
        });
      }
    });

    return acc;
  }, {} as IClassFinances);

  return calculatePlanningCells(totalFinances);
};
