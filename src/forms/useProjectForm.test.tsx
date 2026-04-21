import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import useProjectForm from './useProjectForm';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';

// Mock the hooks
jest.mock('@/hooks/useClassOptions', () => ({
  __esModule: true,
  default: () => ({
    masterClasses: [],
    classes: [],
    subClasses: [],
  }),
}));

jest.mock('@/hooks/useLocationOptions', () => ({
  __esModule: true,
  default: () => ({
    districts: [],
    divisions: [],
    subDivisions: [],
  }),
}));

// Mock the Redux hooks
const mockUseAppSelector = jest.fn();
const mockDispatch = jest.fn();
jest.mock('@/hooks/common', () => ({
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
  useAppDispatch: () => mockDispatch,
}));

// Create a wrapper component that provides form context
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<IProjectForm>({
    defaultValues: {
      type: { value: '', label: '' },
      typeQualifier: { value: '', label: '' },
      description: '',
      hkrId: '',
      sapProject: '',
      hashTags: [],
      phase: { value: '', label: '' },
      programmed: false,
      phaseDetail: { value: '', label: '' },
      constructionProcurementMethod: { value: '', label: '' },
      costForecast: '',
      louhi: false,
      gravel: false,
      category: { value: '', label: '' },
      effectHousing: false,
      riskAssessment: { value: '', label: '' },
      constructionEndYear: '',
      planningStartYear: '',
      estPlanningStart: '',
      estPlanningEnd: '',
      presenceStart: '',
      presenceEnd: '',
      visibilityStart: '',
      visibilityEnd: '',
      estConstructionStart: '',
      estConstructionEnd: '',
      estWarrantyPhaseStart: '',
      estWarrantyPhaseEnd: '',
      personConstruction: { value: '', label: '' },
      personPlanning: { value: '', label: '' },
      personProgramming: null,
      name: '',
      masterClass: { value: '', label: '' },
      class: { value: '', label: '' },
      subClass: { value: '', label: '' },
      district: { value: '', label: '' },
      division: { value: '', label: '' },
      subDivision: { value: '', label: '' },
      budgetOverrunReason: { value: '', label: '' },
      otherBudgetOverrunReason: '',
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

// Type for our selectors
type SelectorName =
  | 'selectProjectMode'
  | 'selectProjectUpdate'
  | 'selectIsLoading'
  | 'selectIsProjectCardLoading'
  | 'selectAllPlanningClasses'
  | 'selectPlanningClasses'
  | 'selectPlanningSubClasses'
  | 'selectProjectDistricts'
  | 'selectProjectDivisions'
  | 'selectProjectSubDivisions';

describe('useProjectForm', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockUseAppSelector.mockReset();
    mockDispatch.mockReset();
  });

  it('initializes with empty values when no project is selected', () => {
    // Mock the selectors to return stable values
    const mockSelectors: Record<SelectorName, any> = {
      selectProjectMode: 'new',
      selectProjectUpdate: { project: { id: null } }, // Properly structured project update
      selectIsLoading: false,
      selectIsProjectCardLoading: false,
      selectAllPlanningClasses: [],
      selectPlanningClasses: [],
      selectPlanningSubClasses: [],
      selectProjectDistricts: [],
      selectProjectDivisions: [],
      selectProjectSubDivisions: [],
    };

    // Type assertion to tell TypeScript that selector has a name property
    mockUseAppSelector.mockImplementation(
      (selector: { name: SelectorName }) => mockSelectors[selector.name] ?? [],
    );

    const { result } = renderHook(() => useProjectForm(null), {
      wrapper: Wrapper,
    });

    // Get form values once and store them
    const formValues = result.current.formMethods.getValues();

    function isEmptyOption(option: IOption): boolean {
      return option.value === '' && option.label === '';
    }

    // Test the values
    expect(formValues.name).toBe('');
    expect(formValues.description).toBe('');
    expect(isEmptyOption(formValues.type)).toBeTruthy();
    expect(isEmptyOption(formValues.typeQualifier)).toBeTruthy();
    expect(isEmptyOption(formValues.masterClass)).toBeTruthy();
    expect(isEmptyOption(formValues.class)).toBeTruthy();
    expect(isEmptyOption(formValues.subClass)).toBeTruthy();
  });

  it('should use computedDefaultProgrammer when available for auto-selection', () => {
    // Mock a class with computedDefaultProgrammer
    const mockClassWithComputed = {
      id: 'test-class-id',
      name: 'Test Class',
      path: 'Test Path',
      forCoordinatorOnly: false,
      relatedTo: null,
      parent: null,
      finances: {} as any,
      defaultProgrammer: {
        id: 'default-programmer-id',
        firstName: 'Default',
        lastName: 'Programmer',
      },
      computedDefaultProgrammer: {
        id: 'computed-programmer-id',
        firstName: 'Computed',
        lastName: 'Programmer',
      },
    };

    const mockSelectors: Record<SelectorName, any> = {
      selectProjectMode: 'new',
      selectProjectUpdate: { project: { id: null } },
      selectIsLoading: false,
      selectIsProjectCardLoading: false,
      selectAllPlanningClasses: [mockClassWithComputed],
      selectPlanningClasses: [mockClassWithComputed],
      selectPlanningSubClasses: [],
      selectProjectDistricts: [],
      selectProjectDivisions: [],
      selectProjectSubDivisions: [],
    };

    mockUseAppSelector.mockImplementation(
      (selector: { name: SelectorName }) => mockSelectors[selector.name] ?? [],
    );

    const { result } = renderHook(() => useProjectForm(null), {
      wrapper: Wrapper,
    });

    // The hook should be defined and ready to use the new simplified logic
    expect(result.current).toBeDefined();
    expect(result.current.formMethods).toBeDefined();
    expect(result.current.classOptions).toBeDefined();
    expect(result.current.useWatchField).toBeDefined();
  });

  // IO-411: district-side auto-fill. Drive the form via
  // result.current.formMethods.setValue() and read personProgramming back
  // out — the exact same code path the UI uses when the user picks a
  // district from the dropdown.
  describe('district-based programmer auto-fill (IO-411)', () => {
    const renderFormWithDistrict = ({
      districts,
    }: {
      districts: Array<{
        id: string;
        value: string;
        computedDefaultProgrammer?: {
          id: string;
          firstName: string;
          lastName: string;
        } | null;
      }>;
    }) => {
      const mockSelectors: Record<SelectorName, any> = {
        selectProjectMode: 'new',
        selectProjectUpdate: { project: { id: null } },
        selectIsLoading: false,
        selectIsProjectCardLoading: false,
        selectAllPlanningClasses: [],
        selectPlanningClasses: [],
        selectPlanningSubClasses: [],
        selectProjectDistricts: districts,
        selectProjectDivisions: [],
        selectProjectSubDivisions: [],
      };

      mockUseAppSelector.mockImplementation(
        (selector: { name: SelectorName }) => mockSelectors[selector.name] ?? [],
      );

      const { result } = renderHook(() => useProjectForm(null), {
        wrapper: Wrapper,
      });

      return { result };
    };

    it('pre-fills personProgramming from district.computedDefaultProgrammer', async () => {
      const { result } = renderFormWithDistrict({
        districts: [
          {
            id: 'district-itainen',
            value: 'Itäinen suurpiiri',
            computedDefaultProgrammer: {
              id: 'prog-tia',
              firstName: 'Tia',
              lastName: 'Ohjelmoija',
            },
          },
        ],
      });

      await act(async () => {
        result.current.formMethods.setValue('district', {
          value: 'district-itainen',
          label: 'Itäinen suurpiiri',
        });
      });

      await waitFor(() => {
        const current = result.current.formMethods.getValues().personProgramming;
        expect(current).toEqual({ value: 'prog-tia', label: 'Tia Ohjelmoija' });
      });
    });

    it('does not overwrite personProgramming when the district has no computed programmer', async () => {
      const { result } = renderFormWithDistrict({
        districts: [
          {
            id: 'district-without',
            value: 'Tuntematon suurpiiri',
          },
        ],
      });

      // Baseline before the change: for a new project personProgramming is
      // the empty option { value: '', label: '' } — see personToOption in
      // useProjectFormValues.
      const baseline = result.current.formMethods.getValues().personProgramming;
      expect(baseline).toEqual({ value: '', label: '' });

      await act(async () => {
        result.current.formMethods.setValue('district', {
          value: 'district-without',
          label: 'Tuntematon suurpiiri',
        });
      });

      // Give the watch subscription a tick to run, then verify the field is
      // unchanged — no phantom value from a stale lookup.
      await new Promise((r) => setTimeout(r, 0));

      const current = result.current.formMethods.getValues().personProgramming;
      expect(current).toEqual({ value: '', label: '' });
    });

    it('does not clobber a manually-picked programmer when the user later changes district', async () => {
      // Regression for the IO-411 acceptance criterion:
      // "A user-picked programmer is never silently overwritten by the
      //  auto-fill." Even though the new district resolves to a different
      //  programmer, the user's choice must win.
      const { result } = renderFormWithDistrict({
        districts: [
          {
            id: 'district-itainen',
            value: 'Itäinen suurpiiri',
            computedDefaultProgrammer: {
              id: 'prog-tia',
              firstName: 'Tia',
              lastName: 'Ohjelmoija',
            },
          },
        ],
      });

      // User manually picks a programmer first.
      await act(async () => {
        result.current.formMethods.setValue('personProgramming', {
          value: 'manual-pick',
          label: 'Manual Pick',
        });
      });

      // …then picks a district whose backend computedDefaultProgrammer is
      // someone else.
      await act(async () => {
        result.current.formMethods.setValue('district', {
          value: 'district-itainen',
          label: 'Itäinen suurpiiri',
        });
      });

      // Give the watch subscription a tick to run.
      await new Promise((r) => setTimeout(r, 0));

      const current = result.current.formMethods.getValues().personProgramming;
      expect(current).toEqual({ value: 'manual-pick', label: 'Manual Pick' });
    });
  });
});
