import { convertToGroupValues, frameBudgetHandler } from './reportHelpers';
import { createListItem, createProject, createSapCost } from '@/mocks/createMocks';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

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

  describe('convertToGroupValues', () => {
    it('should aggregate project and SAP cost data for groups while formatting results', () => {
      const forcedToFrameBudget = '8000';
      const currentYear = new Date().getFullYear();

      const projectOne = createProject({
        id: 'project-one',
        name: 'Project One',
        spentBudget: '1000',
        sapProject: 'sap-1',
        finances: {
          year: currentYear,
          budgetProposalCurrentYearPlus0: '5000',
          budgetProposalCurrentYearPlus1: '6000',
          budgetProposalCurrentYearPlus2: '7000',
        },
        budgetOverrunReason: createListItem('otherReason'),
        otherBudgetOverrunReason: 'Custom reason',
        onSchedule: true,
      });

      const projectTwo = createProject({
        id: 'project-two',
        name: 'Project Two',
        spentBudget: '2000',
        sapProject: 'sap-1',
        finances: {
          year: currentYear,
          budgetProposalCurrentYearPlus0: '4000',
          budgetProposalCurrentYearPlus1: '3000',
          budgetProposalCurrentYearPlus2: '2000',
        },
        budgetOverrunReason: createListItem('delayed'),
        onSchedule: false,
      });

      const sapCosts = {
        [projectOne.id]: createSapCost('sap-cost-1', 2000000, 1000000),
        [projectTwo.id]: createSapCost('sap-cost-2', 2000000, 1000000),
      };

      const currentYearSapValues = {
        [projectOne.id]: createSapCost('sap-current-1', 500000, 250000),
        [projectTwo.id]: createSapCost('sap-current-2', 500000, 250000),
      };

      const result = convertToGroupValues(
        [projectOne, projectTwo],
        forcedToFrameBudget,
        sapCosts,
        currentYearSapValues,
      );

      expect(result).toEqual({
        spentBudget: '3,0',
        budgetProposalCurrentYearPlus0: '9,0',
        budgetProposalCurrentYearPlus1: '9,0',
        budgetProposalCurrentYearPlus2: '9,0',
        costForecastDeviation: '1,0',
        isProjectOnSchedule: 'option.false',
        costForecastDeviationPercent: '13%',
        currentYearSapCost: '0,8',
        beforeCurrentYearSapCosts: '2,3',
        budgetOverrunReason: 'Project One: Custom reason\nProject Two: option.delayed',
      });
    });

    it('should aggregate project and SAP costs from projects with distinct sapProject values', () => {
      const forcedToFrameBudget = '5000';
      const currentYear = new Date().getFullYear();

      const projectAlpha = createProject({
        id: 'project-alpha',
        name: 'Project Alpha',
        spentBudget: '1000',
        sapProject: 'sap-alpha',
        projectGroup: 'group-alpha',
        finances: {
          year: currentYear,
          budgetProposalCurrentYearPlus0: '5000',
          budgetProposalCurrentYearPlus1: '6000',
          budgetProposalCurrentYearPlus2: '7000',
        },
      });

      const projectBeta = createProject({
        id: 'project-beta',
        name: 'Project Beta',
        spentBudget: '2000',
        sapProject: 'sap-beta',
        projectGroup: 'group-alpha',
        finances: {
          year: currentYear,
          budgetProposalCurrentYearPlus0: '3000',
          budgetProposalCurrentYearPlus1: '2000',
          budgetProposalCurrentYearPlus2: '1000',
        },
      });

      const sapCosts = {
        [projectAlpha.id]: createSapCost('sap-cost-alpha', 2000000, 1000000),
        [projectBeta.id]: createSapCost('sap-cost-beta', 1000000, 2000000),
      };

      const currentYearSapValues = {
        [projectAlpha.id]: createSapCost('sap-current-alpha', 500000, 500000),
        [projectBeta.id]: createSapCost('sap-current-beta', 250000, 250000),
      };

      const result = convertToGroupValues(
        [projectAlpha, projectBeta],
        forcedToFrameBudget,
        sapCosts,
        currentYearSapValues,
      );

      expect(result).toEqual({
        spentBudget: '3,0',
        budgetProposalCurrentYearPlus0: '8,0',
        budgetProposalCurrentYearPlus1: '8,0',
        budgetProposalCurrentYearPlus2: '8,0',
        costForecastDeviation: '3,0',
        isProjectOnSchedule: 'option.true',
        costForecastDeviationPercent: '60%',
        currentYearSapCost: '1,5',
        beforeCurrentYearSapCosts: '4,5',
        budgetOverrunReason: '',
      });
    });

    it('should handle empty values and missing optional data gracefully', () => {
      const currentYear = new Date().getFullYear();
      const project = createProject({
        id: 'project-zero',
        name: 'Zero Project',
        finances: {
          year: currentYear,
        },
      });

      const result = convertToGroupValues([project], undefined);

      expect(result).toEqual({
        spentBudget: '0,0',
        budgetProposalCurrentYearPlus0: '0,0',
        budgetProposalCurrentYearPlus1: '0,0',
        budgetProposalCurrentYearPlus2: '0,0',
        costForecastDeviation: '0,0',
        isProjectOnSchedule: 'option.true',
        costForecastDeviationPercent: '100%',
        currentYearSapCost: '0,0',
        beforeCurrentYearSapCosts: '0,0',
        budgetOverrunReason: '',
      });
    });
  });
});
