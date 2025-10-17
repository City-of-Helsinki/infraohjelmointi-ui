import { IProjectFinances } from '@/interfaces/projectInterfaces';
import { moveBudgetBackwards, moveBudgetForwards } from './financesUtils';

const createFinances = (overrides: Partial<IProjectFinances> = {}): IProjectFinances => ({
  year: new Date().getFullYear(),
  budgetProposalCurrentYearPlus0: '100.00',
  budgetProposalCurrentYearPlus1: '150.00',
  budgetProposalCurrentYearPlus2: '200.00',
  preliminaryCurrentYearPlus3: '250.00',
  preliminaryCurrentYearPlus4: '300.00',
  preliminaryCurrentYearPlus5: '400.00',
  preliminaryCurrentYearPlus6: '500.00',
  preliminaryCurrentYearPlus7: '0.00',
  preliminaryCurrentYearPlus8: '0.00',
  preliminaryCurrentYearPlus9: '0.00',
  preliminaryCurrentYearPlus10: '0.00',
  ...overrides,
});

describe('moveBudgetForwards', () => {
  it('moves budget from years before the new start year to the new start year', () => {
    const currentYear = new Date().getFullYear();
    const finances = createFinances({ year: currentYear });

    const result = moveBudgetForwards(finances, currentYear - 1, currentYear + 2);

    expect(result.budgetProposalCurrentYearPlus0).toBe('0.00');
    expect(result.budgetProposalCurrentYearPlus1).toBe('0.00');
    expect(result.budgetProposalCurrentYearPlus2).toBe('450.00');
    expect(result.preliminaryCurrentYearPlus3).toBe('250.00');

    // Original object should remain unchanged
    expect(finances.budgetProposalCurrentYearPlus0).toBe('100.00');
    expect(finances.budgetProposalCurrentYearPlus1).toBe('150.00');
    expect(finances.budgetProposalCurrentYearPlus2).toBe('200.00');
  });
});

describe('moveBudgetBackwards', () => {
  it('moves budget from years after the new end year back to the new end year', () => {
    const currentYear = new Date().getFullYear();
    const finances = createFinances({
      year: currentYear,
    });

    const result = moveBudgetBackwards(finances, currentYear + 6, currentYear + 3);

    expect(result.preliminaryCurrentYearPlus6).toBe('0.00');
    expect(result.preliminaryCurrentYearPlus5).toBe('0.00');
    expect(result.preliminaryCurrentYearPlus4).toBe('0.00');
    expect(result.preliminaryCurrentYearPlus3).toBe('1450.00');

    // Original object should remain unchanged
    expect(finances.preliminaryCurrentYearPlus5).toBe('400.00');
    expect(finances.preliminaryCurrentYearPlus6).toBe('500.00');
    expect(finances.preliminaryCurrentYearPlus4).toBe('300.00');
  });
});
