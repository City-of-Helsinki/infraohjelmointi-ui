import { IProjectFinances } from '@/interfaces/projectInterfaces';

type BudgetKey = Exclude<keyof IProjectFinances, 'year'>;

const getFinanceYearName = (finances: IProjectFinances, year: number): BudgetKey | null => {
  const index = year - finances.year;
  const key =
    index < 3 ? `budgetProposalCurrentYearPlus${index}` : `preliminaryCurrentYearPlus${index}`;

  if (Object.prototype.hasOwnProperty.call(finances, key)) {
    return key as BudgetKey;
  }

  return null;
};

type FinanceValue = IProjectFinances[BudgetKey];

const parseFinanceValue = (value: FinanceValue): number =>
  typeof value === 'number' ? value : parseFloat(`${value ?? 0}`);

/**
 * Accumulates the numeric budget values for the specified years and resets their
 * corresponding entries in the provided finances copy to zero.
 *
 * @param finances - The original finances object containing budget values keyed by year name.
 * @param financesCopy - A mutable copy of the finances object whose selected year values will be cleared.
 * @param years - The list of years whose budget values should be summed and cleared.
 * @returns The total accumulated budget for the specified years.
 */
const accumulateAndClearBudget = (
  finances: IProjectFinances,
  financesCopy: IProjectFinances,
  years: Array<number>,
): number => {
  return years.reduce((total, year) => {
    const financeYearName = getFinanceYearName(finances, year);
    if (financeYearName === null) {
      return total;
    }

    const financeValue = finances[financeYearName];
    const numericValue = parseFinanceValue(financeValue);
    financesCopy[financeYearName] = '0.00';

    return total + numericValue;
  }, 0);
};

/**
 * Reallocates budget entries from prior years into a later start year and returns the updated finances.
 *
 * @param finances - The original project finances object to adjust.
 * @param previousStartYear - The original project start year before the shift.
 * @param startYear - The new project start year after the shift.
 * @returns A new finances object with budget redistributed, or the original finances if the end year field cannot be resolved.
 */
export const moveBudgetForwards = (
  finances: IProjectFinances,
  previousStartYear: number | string,
  startYear: number | string,
): IProjectFinances => {
  const financesCopy = { ...finances };

  const numberOfYears = Math.max(0, Number(startYear) - Number(previousStartYear));
  const yearsToClear = Array.from(
    { length: numberOfYears },
    (_, index) => Number(previousStartYear) + index,
  );
  const budgetToMove = accumulateAndClearBudget(finances, financesCopy, yearsToClear);

  const startYearName = getFinanceYearName(finances, Number(startYear));
  if (startYearName === null) {
    return finances;
  }

  const startYearValue = finances[startYearName];
  const startYearNumericValue = parseFinanceValue(startYearValue);
  const newBudget = startYearNumericValue + budgetToMove;

  financesCopy[startYearName] = newBudget.toFixed(2);
  return financesCopy;
};

/**
 * Reallocates project finances when the end year is moved backwards by clearing budgets
 * beyond the new end year and aggregating their values into the new end year entry.
 *
 * @param finances The original project finances object to adjust.
 * @param previousEndYear The end year before the change that may contain budget to move.
 * @param endYear The updated end year that should receive the reallocated budget.
 * @returns A new finances object with budget redistributed, or the original finances if the end year field cannot be resolved.
 */
export const moveBudgetBackwards = (
  finances: IProjectFinances,
  previousEndYear: number | string,
  endYear: number | string,
): IProjectFinances => {
  const financesCopy = { ...finances };

  const numberOfYears = Math.max(Number(previousEndYear) - Number(endYear), 0);
  const maxIndex = 10 - (Number(endYear) - finances.year);
  const yearsToClear: Array<number> = [];

  for (let i = 1; i <= numberOfYears && i <= maxIndex; ++i) {
    yearsToClear.push(Number(endYear) + i);
  }

  const budgetToMove = accumulateAndClearBudget(finances, financesCopy, yearsToClear);

  const endYearName = getFinanceYearName(finances, Number(endYear));
  if (endYearName === null) {
    return finances;
  }

  const endYearValue = finances[endYearName];
  const endYearNumericValue = parseFinanceValue(endYearValue);
  const newBudget = endYearNumericValue + budgetToMove;

  financesCopy[endYearName] = newBudget.toFixed(2);
  return financesCopy;
};
