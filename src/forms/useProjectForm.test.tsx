import React from 'react';
import { renderHook } from '@testing-library/react';
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
      entityName: '',
      description: '',
      area: { value: '', label: '' },
      hkrId: '',
      sapProject: '',
      sapNetwork: '',
      hashTags: [],
      phase: { value: '', label: '' },
      programmed: false,
      constructionPhaseDetail: { value: '', label: '' },
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
  | 'selectProject'
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
      selectProject: null,
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

    const { result } = renderHook(() => useProjectForm(), {
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
    expect(isEmptyOption(formValues.area)).toBeTruthy();
    expect(isEmptyOption(formValues.masterClass)).toBeTruthy();
    expect(isEmptyOption(formValues.class)).toBeTruthy();
    expect(isEmptyOption(formValues.subClass)).toBeTruthy();
  });
});
