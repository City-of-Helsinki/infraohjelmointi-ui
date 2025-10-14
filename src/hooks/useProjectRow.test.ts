import { renderHook, waitFor } from '@testing-library/react';
import useProjectRow from './useProjectRow';
import { createProject, createSapCost } from '@/mocks/createMocks';
import { IProjectCell } from '@/interfaces/projectInterfaces';

const mockUseAppSelector = jest.fn();

jest.mock('./common', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) => mockUseAppSelector(selector),
}));

describe('useProjectRow', () => {
  beforeEach(() => {
    mockUseAppSelector.mockReset();
  });

  it('returns cells, sums and project finances for the provided project', async () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ planning: { forcedToFrame: false } } as unknown),
    );

    const project = createProject({
      costForecast: '1500',
      spentBudget: '0',
      finances: {
        year: 2025,
        budgetProposalCurrentYearPlus0: '100.00',
        budgetProposalCurrentYearPlus1: '200.00',
        budgetProposalCurrentYearPlus2: '300.00',
        preliminaryCurrentYearPlus3: '4000.00',
        preliminaryCurrentYearPlus4: '3000.00',
        preliminaryCurrentYearPlus5: null,
        preliminaryCurrentYearPlus6: '3000.00',
        preliminaryCurrentYearPlus7: '3000.00',
        preliminaryCurrentYearPlus8: '3000.00',
        preliminaryCurrentYearPlus9: '5000.00',
        preliminaryCurrentYearPlus10: '0.00',
      },
      planningStartYear: 2025,
      estPlanningStart: '01.01.2025',
      estPlanningEnd: '31.12.2027',
      estConstructionStart: '01.01.2028',
      estConstructionEnd: '31.12.2034',
      constructionEndYear: 2034,
    });

    const sapCosts = createSapCost('sap-id', 100, 200);
    const expectedCellCount = Object.keys(project.finances).length - 1;

    const expectedCells: Array<Partial<IProjectCell>> = [
      {
        budget: '100.00',
        type: 'planningStart',
      },
      {
        budget: '200.00',
        type: 'planning',
      },
      {
        budget: '300.00',
        type: 'planningEnd',
      },
      {
        budget: '4000.00',
        type: 'constructionStart',
      },
      {
        budget: '3000.00',
        type: 'construction',
      },
      {
        budget: null,
        type: 'none',
      },
      {
        budget: '3000.00',
        type: 'construction',
      },
      {
        budget: '3000.00',
        type: 'construction',
      },
      {
        budget: '3000.00',
        type: 'construction',
      },
      {
        budget: '5000.00',
        type: 'constructionEnd',
      },
      {
        budget: '0.00',
        type: 'none',
      },
    ];

    const { result } = renderHook(() => useProjectRow(project, sapCosts));

    await waitFor(() => {
      expect(result.current.cells).toHaveLength(expectedCellCount);
    });

    result.current.cells.forEach((cell, i) => {
      expect(cell.type).toBe(expectedCells[i].type);
      expect(cell.budget).toBe(expectedCells[i].budget);
    });
    expect(result.current.sums).toEqual({
      availableFrameBudget: '21 600',
      costEstimateBudget: '1 500',
    });
    expect(result.current.projectFinances).toEqual(project.finances);
  });
});
