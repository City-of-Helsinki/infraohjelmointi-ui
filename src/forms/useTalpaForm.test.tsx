import { renderHook } from '@testing-library/react';
import useTalpaForm from './useTalpaForm';
import { BudgetItemNumber } from '@/components/Project/ProjectTalpa/budgetItemNumber';
import { ITalpaProjectOpening, TalpaReadiness } from '@/interfaces/talpaInterfaces';
import mockTalpaProject from '@/mocks/mockTalpaProject';
import { TalpaProfileName } from '@/components/Project/ProjectTalpa/profileName';

const mockUseAppSelector = jest.fn();
const mockDispatch = jest.fn();

jest.mock('@/hooks/common', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/hooks/usePostalCode', () => ({
  usePostalCode: (address: string) => {
    if (address === 'Testitie 1') {
      return { postalCode: '00100', city: 'Helsinki' };
    }
    return { postalCode: '', city: '' };
  },
}));

type SelectorName =
  | 'selectProject'
  | 'selectTalpaProject'
  | 'selectPlanningClasses'
  | 'selectPlanningSubClasses'
  | 'selectResponsiblePersonsRaw';

function buildTalpaProject(overrides: Partial<ITalpaProjectOpening> = {}): ITalpaProjectOpening {
  return {
    ...mockTalpaProject,
    ...overrides,
  };
}

describe('useTalpaForm', () => {
  beforeEach(() => {
    mockUseAppSelector.mockReset();
    mockDispatch.mockReset();
  });

  it('returns default form values when no talpa project data is loaded', () => {
    const project = {
      id: 'project-1',
      estPlanningStart: '2025-05-01',
      estConstructionEnd: '2025-11-30',
      estWarrantyPhaseEnd: '2025-12-31',
      projectClass: 'ddbf3ce8-5bc4-410b-8759-e68d80dad99e',
      personProgramming: {
        id: 'programmer-1',
        firstName: 'Erkki',
        lastName: 'Esimerkki',
        person: 'person-1',
      },
      address: 'Testitie 1',
    };

    const planningClass = {
      id: 'ddbf3ce8-5bc4-410b-8759-e68d80dad99e',
      name: '8 03 01 01 Uudisrakentaminen',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectors: Record<SelectorName, any> = {
      selectProject: project,
      selectTalpaProject: null,
      selectPlanningClasses: [planningClass],
      selectPlanningSubClasses: [],
      selectResponsiblePersonsRaw: [
        {
          id: 'person-1',
          firstName: 'Erkki',
          lastName: 'Esimerkki',
          email: 'erkki.esimerkki@example.com',
        },
      ],
    };

    mockUseAppSelector.mockImplementation((selector: { name: SelectorName }) => {
      return selectors[selector.name];
    });

    const { result } = renderHook(() => useTalpaForm());

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    const values = result.current.getValues();

    expect(values).toEqual({
      budgetItemNumber: BudgetItemNumber.InfraInvestment,
      budgetAccount: '8 03 01 01 Uudisrakentaminen',
      projectNumberRange: null,
      templateProject: '2814I00000',
      projectType: null,
      priority: null,
      projectName: '',
      projectStart: '2025-05-01',
      projectEnd: '2025-12-31',
      streetAddress: 'Testitie 1',
      postalCode: '00100',
      responsiblePerson: 'Erkki Esimerkki',
      responsiblePersonEmail: 'erkki.esimerkki@example.com',
      serviceClass: null,
      assetClass: null,
      profileName: TalpaProfileName.FixedStructures,
      holdingTime: null,
      investmentProfile: 'Z12550',
      readiness: {
        label: TalpaReadiness.Kesken,
        value: TalpaReadiness.Kesken,
      },
    });
  });

  it('populates form values when talpa project data is loaded', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectors: Record<SelectorName, any> = {
      selectProject: { id: 'f0edf54d-4367-49c7-bb42-1420cacebb3e' },
      selectTalpaProject: null,
      selectPlanningClasses: [],
      selectPlanningSubClasses: [],
      selectResponsiblePersonsRaw: [],
    };

    mockUseAppSelector.mockImplementation((selector: { name: SelectorName }) => {
      return selectors[selector.name];
    });

    const talpaProject = buildTalpaProject();

    const { result, rerender } = renderHook(() => useTalpaForm());

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    selectors.selectTalpaProject = talpaProject;
    rerender();

    const values = result.current.getValues();

    expect(values.id).toBe('a5566bf7-a6fc-49bc-99b9-65341a684a32');
    expect(values.budgetItemNumber).toBe(BudgetItemNumber.InfraInvestment);
    expect(values.projectNumberRange).toEqual({
      label: 'Etelainen suurpiiri / 2814I00003 - 2814I00300',
      value: 'ed0ce936-49c5-4ac7-b964-f8b51104842b',
    });
    expect(values.templateProject).toBe('2814I00000');
    expect(values.projectType).toEqual({
      label: 'Uudisrakentaminen',
      value: '7c81a524-906d-478d-be10-be708ccffa41',
    });
    expect(values.priority).toEqual({
      label: 'A / Etelainen suurpiiri',
      value: '7c81a524-906d-478d-be10-be708ccffa41',
    });
    expect(values.projectStart).toBe('10.01.2025');
    expect(values.projectEnd).toBe('20.02.2025');
    expect(values.serviceClass).toEqual({
      label: '3551 Liikunta- ja ulkoilupalvelut',
      value: '973b4005-7dd9-4193-af28-a17a8f7d8a59',
    });
    expect(values.assetClass).toEqual({
      label: 'Kadut, tiet ja torit (puistot) (20 v) / 8106100',
      value: '95d58127-342e-4649-bed6-d8430a0a06ca',
    });
    expect(values.holdingTime).toBe(20);
    expect(values.readiness).toEqual({
      label: TalpaReadiness.Kesken,
      value: TalpaReadiness.Kesken,
    });
  });

  it('wraps template project label to option when budget item number is not infra investment', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectors: Record<SelectorName, any> = {
      selectProject: null,
      selectTalpaProject: buildTalpaProject({
        id: 'a5566bf7-a6fc-49bc-99b9-65341a684a33',
        budgetAccount: '8 01 03 01 Muu esirakentaminen',
        projectNumberRange: {
          id: '09868124-3ea1-495e-8486-970fcac28877',
          projectTypePrefix: BudgetItemNumber.PreConstruction,
          budgetAccount: '8 01 03 01 Muu esirakentaminen (MuuEsir.)',
          budgetAccountNumber: '8 01 03 01',
          rangeStart: '2814E01600',
          rangeEnd: '2814E03999',
          majorDistrict: '',
          majorDistrictName: '',
          area: '',
          unit: 'Mao',
          contactPerson: '',
          contactEmail: '',
          transferNote: '',
          notes: '',
          isActive: true,
          updatedDate: '2025-01-01',
        },
        templateProject: '2814E00012',
        projectType: {
          id: '7c81a524-906d-478d-be10-be708ccffa41',
          code: '8010301',
          name: 'Muu esirakentaminen',
          category: '',
          priority: 'B',
          description: '',
          isActive: true,
          notes: '',
        },
        projectName: 'Toinen projekti',
        projectStartDate: '2025-03-15',
        projectEndDate: '2025-04-15',
        streetAddress: 'Testitie 2',
        postalCode: '00200',
        responsiblePerson: 'John Doe',
        responsiblePersonEmail: 'john@example.com',
        serviceClass: null,
        assetClass: {
          id: '95d58127-342e-4649-bed6-d8430a0a06ca',
          componentClass: '8103000',
          account: '103000',
          name: 'Maa- ja vesialueet',
          hasHoldingPeriod: false,
          holdingPeriodYears: null,
          category: 'Aineelliset hyodykkeet',
          isActive: true,
        },
        holdingTime: undefined,
        profileName: 'Profiili B',
        investmentProfile: 'Z12525',
        readiness: TalpaReadiness.Kesken,
        project: 'f0edf54d-4367-49c7-bb42-1420cacebb3e',
      }),
      selectPlanningClasses: [],
      selectPlanningSubClasses: [],
      selectResponsiblePersonsRaw: [],
    };

    mockUseAppSelector.mockImplementation((selector: { name: SelectorName }) => {
      return selectors[selector.name];
    });

    const { result } = renderHook(() => useTalpaForm());

    const values = result.current.getValues();

    expect(values.templateProject).toEqual({
      label: '2814E00012',
      value: '2814E00012',
    });
    expect(values.projectNumberRange).toEqual({
      label: 'Mao / 2814E01600 - 2814E03999',
      value: '09868124-3ea1-495e-8486-970fcac28877',
    });
    expect(values.projectStart).toBe('15.03.2025');
    expect(values.holdingTime).toBeNull();
  });
});
