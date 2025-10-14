import { getRemoveRequestData } from './projectCellUtils';
import {
  IProjectCell,
  IProjectEstDates,
  IProjectFinancesRequestObject,
  ITimelineDates,
} from '@/interfaces/projectInterfaces';

const baseTimelineDates: ITimelineDates = {
  planningStart: '01.01.2025',
  planningEnd: '31.12.2027',
  constructionStart: '01.01.2028',
  constructionEnd: '31.12.2029',
  estWarrantyPhaseStart: null,
  estWarrantyPhaseEnd: null,
};

const baseProjectEstDates: IProjectEstDates = {
  estPlanningStart: '01.01.2025',
  estPlanningEnd: '31.12.2027',
  estConstructionStart: '01.01.2028',
  estConstructionEnd: '31.12.2029',
};

const createCell = (overrides: Partial<IProjectCell> = {}): IProjectCell => ({
  year: 2025,
  startYear: 2025,
  type: 'planning',
  prev: null,
  next: null,
  isStartOfTimeline: false,
  isEndOfTimeline: false,
  isLastOfType: false,
  financeKey: 'budgetProposalCurrentYearPlus0',
  budget: '100',
  cellToUpdate: null,
  financesToReset: {} as IProjectFinancesRequestObject,
  growDirections: [],
  title: 'Test project cell',
  id: 'project-1',
  affectsDates: true,
  monthlyDataList: [],
  timelineDates: { ...baseTimelineDates },
  projectEstDates: { ...baseProjectEstDates },
  ...overrides,
});

const createOverlapCell = (overrides: Partial<IProjectCell> = {}): IProjectCell =>
  createCell({
    type: 'overlap',
    year: 2027,
    ...overrides,
  });

describe('getRemoveRequestData planning deletion behaviour', () => {
  it('shifts planning start forward and merges finances when removing the first planning cell', () => {
    const cellToUpdate = createCell({
      year: 2026,
      financeKey: 'budgetProposalCurrentYearPlus1',
      budget: '200',
      type: 'planning',
      cellToUpdate: null,
      affectsDates: false,
    });

    const cell = createCell({
      type: 'planningStart',
      year: 2025,
      financeKey: 'budgetProposalCurrentYearPlus0',
      budget: '100',
      isStartOfTimeline: true,
      cellToUpdate,
    });

    const result = getRemoveRequestData(cell);

    expect(result.estPlanningStart).toBe('01.01.2026');
    expect(result.planningStartYear).toBe(2026);
    expect(result.finances?.budgetProposalCurrentYearPlus1).toBe('300');
    expect(result.finances?.budgetProposalCurrentYearPlus0).toBe('0');
    expect(result.finances?.year).toBe(2025);
  });

  it('sets finances to null for a year when removing a middle planning cell', () => {
    const cell = createCell({
      type: 'planning',
      year: 2026,
      financeKey: 'budgetProposalCurrentYearPlus1',
      budget: '100',
      isStartOfTimeline: false,
      isEndOfTimeline: false,
      affectsDates: false,
    });

    const result = getRemoveRequestData(cell);

    expect(result.finances?.budgetProposalCurrentYearPlus1).toBeNull();
  });

  it('moves planning end left and accumulates finances when removing planning end cell', () => {
    const previousCell = createCell({
      year: 2026,
      financeKey: 'budgetProposalCurrentYearPlus0',
      budget: '200',
      type: 'planning',
      cellToUpdate: null,
    });

    const cell = createCell({
      type: 'planningEnd',
      year: 2027,
      financeKey: 'budgetProposalCurrentYearPlus1',
      budget: '150',
      isEndOfTimeline: false,
      isLastOfType: false,
      cellToUpdate: previousCell,
    });

    const result = getRemoveRequestData(cell);

    expect(result.estPlanningEnd).toBe('31.12.2026');
    expect(result.finances?.budgetProposalCurrentYearPlus0).toBe('350');
    expect(result.finances?.budgetProposalCurrentYearPlus1).toBe('0');
  });
});

describe('getRemoveRequestData construction deletion behaviour', () => {
  it('moves construction start forward when removing the construction start cell', () => {
    const nextConstructionCell = createCell({
      year: 2029,
      financeKey: 'budgetProposalCurrentYearPlus1',
      budget: '200',
      type: 'construction',
      cellToUpdate: null,
    });

    const cell = createCell({
      type: 'constructionStart',
      year: 2028,
      financeKey: 'budgetProposalCurrentYearPlus0',
      budget: '150',
      isStartOfTimeline: true,
      cellToUpdate: nextConstructionCell,
    });

    const result = getRemoveRequestData(cell);

    expect(result.estConstructionStart).toBe('01.01.2029');
    expect(result.constructionEndYear).toBe(2029);
    expect(result.finances?.budgetProposalCurrentYearPlus1).toBe('350');
    expect(result.finances?.budgetProposalCurrentYearPlus0).toBe('0');
  });

  it('pulls construction end left and merges finances when removing a construction end cell', () => {
    const previousConstructionCell = createCell({
      year: 2028,
      financeKey: 'budgetProposalCurrentYearPlus1',
      budget: '125',
      type: 'construction',
      cellToUpdate: null,
    });

    const cell = createCell({
      type: 'constructionEnd',
      year: 2029,
      financeKey: 'budgetProposalCurrentYearPlus2',
      budget: '175',
      isLastOfType: false,
      cellToUpdate: previousConstructionCell,
    });

    const result = getRemoveRequestData(cell);

    expect(result.estConstructionEnd).toBe('31.12.2028');
    expect(result.constructionEndYear).toBe(2028);
    expect(result.finances?.budgetProposalCurrentYearPlus1).toBe('300');
    expect(result.finances?.budgetProposalCurrentYearPlus2).toBe('0');
  });
});

describe('getRemoveRequestData overlap deletion behaviour', () => {
  it('updates dates correctly when removing the first overlap cell in the timeline', () => {
    const cell = createOverlapCell({ isStartOfTimeline: true });

    const result = getRemoveRequestData(cell);

    expect(result.estPlanningStart).toBe('01.01.2026');
    expect(result.estPlanningEnd).toBe('31.12.2028');
    expect(result.estConstructionStart).toBe('01.01.2029');
    expect(result.planningStartYear).toBe(2028);
    expect(result.finances?.year).toBe(2025);
    expect(result.finances?.budgetProposalCurrentYearPlus0).toBe('0');
    expect(result).not.toHaveProperty('estConstructionEnd');
    expect(result).not.toHaveProperty('constructionEndYear');
  });

  it('updates dates correctly when removing an overlap cell in the middle of the timeline', () => {
    const cell = createOverlapCell();

    const result = getRemoveRequestData(cell);

    expect(result.estPlanningEnd).toBe('31.12.2026');
    expect(result.estConstructionStart).toBe('01.01.2029');
    expect(result.finances?.budgetProposalCurrentYearPlus0).toBe('0');
    expect(result).not.toHaveProperty('planningStartYear');
    expect(result).not.toHaveProperty('constructionEndYear');
  });

  it('updates dates correctly when removing the last overlap cell in the timeline', () => {
    const cell = createOverlapCell({ isEndOfTimeline: true });

    const result = getRemoveRequestData(cell);

    expect(result.estPlanningEnd).toBe('31.12.2026');
    expect(result.estConstructionStart).toBe('01.01.2027');
    expect(result.estConstructionEnd).toBe('31.12.2028');
    expect(result.constructionEndYear).toBe(2028);
    expect(result.finances?.budgetProposalCurrentYearPlus0).toBe('0');
    expect(result).not.toHaveProperty('planningStartYear');
  });
});
