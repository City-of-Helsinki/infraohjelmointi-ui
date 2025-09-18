import { render, screen } from '@testing-library/react';
import ProjectResponsiblePersonsSection from './ProjectResponsiblePersonsSection';
import { useTranslation } from 'react-i18next';
import { Control, FormProvider, useForm } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { fireEvent } from '@testing-library/react';

// Mock the hooks
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock the SelectField component
jest.mock('@/components/shared/SelectField', () => {
  return function MockSelectField({ name, value, options, control }: any) {
    const { Controller } = require('react-hook-form');
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }: { field: { value: any; onChange: (value: any) => void } }) => (
          <div>
            <select
              data-testid={name}
              value={field.value?.value || ''}
              onChange={(e) => {
                const option = options.find((o: any) => o.value === e.target.value);
                field.onChange(option || null);
              }}
            >
              <option value="">Select...</option>
              {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input type="hidden" data-testid={`${name}-value`} value={field.value?.value || ''} />
          </div>
        )}
      />
    );
  };
});

jest.mock('@/hooks/useOptions', () => ({
  useOptions: (key: string) => {
    if (key === 'responsiblePersons') {
      return [
        { value: '', label: '' },
        { value: '1', label: 'John Doe' },
      ];
    }
    if (key === 'phases') {
      return [
        { value: 'phase1', label: 'Phase 1' },
        { value: 'phase2', label: 'Phase 2' },
      ];
    }
    if (key === 'programmers') {
      return [
        { value: 'john.smith', label: 'John Smith' },
        { value: 'jane.doe', label: 'Jane Doe' },
      ];
    }
    return [];
  },
}));

// Mock the class hooks and Redux selectors with configurable data
interface IMockClass {
  id: string;
  name: string;
  defaultProgrammer?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

const mockClassData: {
  masterClasses: IMockClass[];
  classes: IMockClass[];
  subClasses: IMockClass[];
} = {
  masterClasses: [],
  classes: [],
  subClasses: [],
};

jest.mock('@/hooks/useClassOptions', () => ({
  __esModule: true,
  default: () => mockClassData,
}));

// Mock all the Redux selectors
jest.mock('@/reducers/classSlice', () => ({
  selectAllPlanningClasses: () => mockClassData.masterClasses,
  selectPlanningClasses: () => mockClassData.classes,
  selectPlanningSubClasses: () => mockClassData.subClasses,
}));

jest.mock('@/reducers/projectSlice', () => ({
  selectProject: () => null,
  selectProjectMode: () => 'new',
}));

jest.mock('@/reducers/eventsSlice', () => ({
  selectProjectUpdate: () => null,
}));

jest.mock('@/reducers/loaderSlice', () => ({
  selectIsLoading: () => false,
  selectIsProjectCardLoading: () => false,
}));

jest.mock('@/reducers/listsSlice', () => ({
  selectProjectDistricts: () => [],
  selectProjectDivisions: () => [],
  selectProjectSubDivisions: () => [],
}));

const defaultFormValues = {
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
  otherPersons: '',
} as IProjectForm;

const TestComponent = () => {
  const methods = useForm<IProjectForm>({
    defaultValues: defaultFormValues,
  });

  return (
    <FormProvider {...methods}>
      <ProjectResponsiblePersonsSection
        getValues={methods.getValues}
        getFieldProps={(name) => ({
          name,
          label: name,
          control: methods.control,
        })}
        isInputDisabled={false}
        isUserOnlyViewer={false}
      />
    </FormProvider>
  );
};

describe('ProjectResponsiblePersonsSection', () => {
  beforeEach(() => {
    // Reset mock class data before each test
    Object.assign(mockClassData, {
      masterClasses: [],
      classes: [],
      subClasses: [],
    });
  });
  it('shows programmer dropdown and it is enabled', () => {
    render(<TestComponent />);
    const dropdown = screen.getByTestId('personProgramming');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).not.toBeDisabled();
  });

  it('shows programmer options from API', () => {
    render(<TestComponent />);
    const dropdown = screen.getByTestId('personProgramming');
    const options = Array.from(dropdown.getElementsByTagName('option'));
    expect(options.map((o) => o.textContent)).toContain('John Smith');
    expect(options.map((o) => o.textContent)).toContain('Jane Doe');
  });

  it('starts with no programmer selected when no default is set', () => {
    render(<TestComponent />);
    const dropdown = screen.getByTestId('personProgramming');
    const valueInput = screen.getByTestId('personProgramming-value');
    expect(valueInput).toHaveValue('');
  });

  it('allows user to select a programmer', async () => {
    render(<TestComponent />);

    // Find the dropdown and select Jane Doe
    const dropdown = screen.getByTestId('personProgramming');
    fireEvent.change(dropdown, { target: { value: 'jane.doe' } });

    // Wait for the form to update
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Check if the hidden input was updated
    const valueInput = screen.getByTestId('personProgramming-value');
    expect(valueInput).toHaveValue('jane.doe');
  });
});
