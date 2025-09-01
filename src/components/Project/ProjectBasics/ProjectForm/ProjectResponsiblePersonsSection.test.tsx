import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import { mockUser } from '@/mocks/mockUsers';
import { mockResponsiblePersons, mockProjectPhases } from '@/mocks/mockLists';
import { mockProjectClasses } from '@/mocks/mockProjectClasses';
import { useForm } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import ProjectResponsiblePersonsSection from './ProjectResponsiblePersonsSection';
import { act, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetValue = jest.fn();

const TestWrapper = (props: { initialValues?: Partial<IProjectForm> }) => {
  const formMethods = useForm<IProjectForm>({
    defaultValues: {
      masterClass: { value: '', label: '' },
      class: { value: '', label: '' },
      subClass: { value: '', label: '' },
      personPlanning: { value: '', label: '' },
      personProgramming: { value: '', label: '' },
      personConstruction: { value: '', label: '' },
      ...props.initialValues,
    },
  });

  const getFieldProps = (name: string) => ({
    name,
    label: `projectForm.${name}`,
    control: formMethods.control,
  });

  return (
    <Route>
      <ProjectResponsiblePersonsSection
        getFieldProps={getFieldProps}
        getValues={formMethods.getValues}
        setProgrammer={mockSetValue}
        isInputDisabled={false}
        isUserOnlyViewer={false}
      />
    </Route>
  );
};

describe('ProjectResponsiblePersonsSection', () => {
  it('renders responsible person fields', async () => {
    const { findByTestId } = renderWithProviders(<TestWrapper />, {
      preloadedState: {
        auth: { user: mockUser.data, error: {} },
        lists: {
          responsiblePersons: mockResponsiblePersons.data,
          projectClasses: mockProjectClasses,
          phases: mockProjectPhases.data,
          error: {},
        },
      },
    });

    await waitFor(() => {
      expect(findByTestId('personPlanning')).toBeTruthy();
      expect(findByTestId('personProgramming')).toBeTruthy();
      expect(findByTestId('personConstruction')).toBeTruthy();
    });
  });

  it('sets default programmer when project class changes', async () => {
    const { user, findByTestId } = renderWithProviders(
      <TestWrapper
        initialValues={{
          class: { value: 'test-class-1', label: 'Test Class 1' },
        }}
      />,
      {
        preloadedState: {
          auth: { user: mockUser.data, error: {} },
          lists: {
            responsiblePersons: mockResponsiblePersons.data,
            projectClasses: mockProjectClasses,
            phases: mockProjectPhases.data,
            error: {},
          },
        },
      },
    );

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('personProgramming', {
        value: 'default-programmer-id',
        label: 'Default Programmer',
      });
    });
  });

  it('does not set default programmer if one is already selected', async () => {
    const { user, findByTestId } = renderWithProviders(
      <TestWrapper
        initialValues={{
          class: { value: 'test-class-1', label: 'Test Class 1' },
          personProgramming: { value: 'existing-programmer', label: 'Existing Programmer' },
        }}
      />,
      {
        preloadedState: {
          auth: { user: mockUser.data, error: {} },
          lists: {
            responsiblePersons: mockResponsiblePersons.data,
            projectClasses: mockProjectClasses,
            phases: mockProjectPhases.data,
            error: {},
          },
        },
      },
    );

    await waitFor(() => {
      expect(mockSetValue).not.toHaveBeenCalled();
    });
  });

  it('handles disabled and readonly states correctly', async () => {
    const { findByTestId } = renderWithProviders(
      <Route>
        <ProjectResponsiblePersonsSection
          getFieldProps={(name: string) => ({
            name,
            label: `projectForm.${name}`,
            control: useForm<IProjectForm>().control,
          })}
          getValues={() => ({ personProgramming: { value: '', label: '' } })}
          setProgrammer={mockSetValue}
          isInputDisabled={true}
          isUserOnlyViewer={true}
        />
      </Route>,
      {
        preloadedState: {
          auth: { user: mockUser.data, error: {} },
          lists: {
            responsiblePersons: mockResponsiblePersons.data,
            projectClasses: mockProjectClasses,
            phases: mockProjectPhases.data,
            error: {},
          },
        },
      },
    );

    await waitFor(() => {
      const personPlanningField = findByTestId('personPlanning');
      const personProgrammingField = findByTestId('personProgramming');
      const personConstructionField = findByTestId('personConstruction');

      expect(personPlanningField).toBeTruthy();
      expect(personProgrammingField).toBeTruthy();
      expect(personConstructionField).toBeTruthy();
    });
  });
});