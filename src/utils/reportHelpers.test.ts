import { frameBudgetHandler } from './reportHelpers';

describe('reportHelpers', () => {
  describe('frameBudgetHandler', () => {
    it('should calculate frame budget from current year for forecast report', () => {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      // Mock planning cells with budgets for different years
      const mockPlanningCells = [
        {
          key: 'current-year',
          year: currentYear,
          displayFrameBudget: '1000000',
          plannedBudget: '900000',
          frameBudget: '1000000',
          isCurrentYear: true,
          isFrameBudgetOverlap: false,
        },
        {
          key: 'next-year',
          year: nextYear,
          displayFrameBudget: '2000000',
          plannedBudget: '1800000',
          frameBudget: '2000000',
          isCurrentYear: false,
          isFrameBudgetOverlap: false,
        },
      ];

      // Test that forecast report uses current year (default behavior)
      const currentYearResult = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
      );

      expect(currentYearResult).toBe('1000000');

      // Test that when year is explicitly passed, it uses that year
      const nextYearResult = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
        nextYear,
      );

      expect(nextYearResult).toBe('2000000');
    });

    it('should return empty string for non-allowed types', () => {
      const mockPlanningCells = [
        {
          key: 'current-year',
          year: new Date().getFullYear(),
          displayFrameBudget: '1000000',
          plannedBudget: '900000',
          frameBudget: '1000000',
          isCurrentYear: true,
          isFrameBudgetOverlap: false,
        },
      ];

      const result = frameBudgetHandler('invalidType', mockPlanningCells, '8 01 Test Path');

      expect(result).toBe('');
    });

    it('should return empty string for collectiveSubLevel not starting with "8 03"', () => {
      const mockPlanningCells = [
        {
          key: 'current-year',
          year: new Date().getFullYear(),
          displayFrameBudget: '1000000',
          plannedBudget: '900000',
          frameBudget: '1000000',
          isCurrentYear: true,
          isFrameBudgetOverlap: false,
        },
      ];

      const result = frameBudgetHandler(
        'collectiveSubLevel',
        mockPlanningCells,
        '8 01 Test Path', // Doesn't start with "8 03"
      );

      expect(result).toBe('');
    });

    it('should return frame budget for collectiveSubLevel starting with "8 03"', () => {
      const mockPlanningCells = [
        {
          key: 'current-year',
          year: new Date().getFullYear(),
          displayFrameBudget: '1000000',
          plannedBudget: '900000',
          frameBudget: '1000000',
          isCurrentYear: true,
          isFrameBudgetOverlap: false,
        },
      ];

      const result = frameBudgetHandler(
        'collectiveSubLevel',
        mockPlanningCells,
        '8 03 Test Path', // Starts with "8 03"
      );

      expect(result).toBe('1000000');
    });

    it('should return empty string when no budget found for the specified year', () => {
      const mockPlanningCells = [
        {
          key: 'different-year',
          year: 2020, // Different year than current
          displayFrameBudget: '1000000',
          plannedBudget: '900000',
          frameBudget: '1000000',
          isCurrentYear: false,
          isFrameBudgetOverlap: false,
        },
      ];

      const result = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
        // Uses current year by default, but budget is only for 2020
      );

      expect(result).toBe('');
    });

    it('should work with all allowed types', () => {
      const mockPlanningCells = [
        {
          key: 'current-year',
          year: new Date().getFullYear(),
          displayFrameBudget: '1000000',
          plannedBudget: '900000',
          frameBudget: '1000000',
          isCurrentYear: true,
          isFrameBudgetOverlap: false,
        },
      ];

      const allowedTypes = [
        'masterClass',
        'class',
        'subClass',
        'subClassDistrict',
        'districtPreview',
        'collectiveSubLevel',
      ];

      for (const type of allowedTypes) {
        const path = type === 'collectiveSubLevel' ? '8 03 Test Path' : '8 01 Test Path';
        const result = frameBudgetHandler(type, mockPlanningCells, path);
        expect(result).toBe('1000000');
      }
    });

    it('should verify frame budget behavior differences between forecast and strategy report calls', () => {
      // This test demonstrates that the ForecastReport case calls frameBudgetHandler without
      // the year parameter, while Strategy report does pass the year parameter
      const currentYear = new Date().getFullYear();
      const futureYear = currentYear + 2;

      // Mock planning cells with budgets for different years
      const mockPlanningCells = [
        {
          key: 'current-year',
          year: currentYear,
          displayFrameBudget: '1000000',
          plannedBudget: '900000',
          frameBudget: '1000000',
          isCurrentYear: true,
          isFrameBudgetOverlap: false,
        },
        {
          key: 'future-year',
          year: futureYear,
          displayFrameBudget: '3000000',
          plannedBudget: '2700000',
          frameBudget: '3000000',
          isCurrentYear: false,
          isFrameBudgetOverlap: false,
        },
      ];

      // Test how ForecastReport would call frameBudgetHandler (without year parameter)
      const forecastBehavior = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
        // No year parameter - defaults to current year
      );

      // Test how Strategy report would call frameBudgetHandler (with explicit year)
      const strategyBehavior = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
        futureYear, // Explicit year parameter
      );

      // ForecastReport behavior: uses current year budget
      expect(forecastBehavior).toBe('1000000');

      // Strategy report behavior: uses specified year budget
      expect(strategyBehavior).toBe('3000000');

      // Verify that when no budget exists for the year, empty string is returned
      const nonExistentYearResult = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
        1999, // Year that doesn't exist in the mock data
      );
      expect(nonExistentYearResult).toBe('');
    });

    it('should use current year as default when no year parameter is provided', () => {
      // Test with the actual current year to verify default behavior
      const actualCurrentYear = new Date().getFullYear();

      const mockPlanningCells = [
        {
          key: 'current-year',
          year: actualCurrentYear,
          displayFrameBudget: '5000000',
          plannedBudget: '4500000',
          frameBudget: '5000000',
          isCurrentYear: true,
          isFrameBudgetOverlap: false,
        },
        {
          key: 'different-year',
          year: actualCurrentYear + 1,
          displayFrameBudget: '6000000',
          plannedBudget: '5500000',
          frameBudget: '6000000',
          isCurrentYear: false,
          isFrameBudgetOverlap: false,
        },
      ];

      // When no year is provided, it should use the current year by default
      const resultWithoutYear = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
      );

      // When explicit current year is provided, should give same result
      const resultWithCurrentYear = frameBudgetHandler(
        'masterClass',
        mockPlanningCells,
        '8 01 Test Path',
        actualCurrentYear,
      );

      // Both should return the current year's budget
      expect(resultWithoutYear).toBe('5000000');
      expect(resultWithCurrentYear).toBe('5000000');
      expect(resultWithoutYear).toBe(resultWithCurrentYear);
    });
  });
});
