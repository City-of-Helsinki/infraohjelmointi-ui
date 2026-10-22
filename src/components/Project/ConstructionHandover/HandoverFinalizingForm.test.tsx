import mockI18next from '@/mocks/mockI18next';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders, withMockAuthUserAdGroups } from '@/utils/testUtils';
import { Route } from 'react-router';
import { act } from 'react-dom/test-utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import HandoverFinalizingForm from './HandoverFinalizingForm';
import { createConstructionHandover, createProject } from '@/mocks/createMocks';
import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';
import { UserRole } from '@/interfaces/userInterfaces';

const mockPatchConstructionHandover = jest.fn();

jest.mock('@/api/constructionHandoverApi', () => ({
  usePatchConstructionHandoverMutation: () => [mockPatchConstructionHandover],
}));

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/useOptions', () => ({
  useOptions: (listName: string) => {
    if (listName === 'responsiblePersons') {
      return [{ value: 'manager-1', label: 'Project Manager' }];
    }

    if (listName === 'constructionProcurementMethods') {
      return [{ value: 'method-1', label: 'Stara' }];
    }

    if (listName === 'staraProcurementReasons') {
      return [{ value: 'reason-1', label: 'urgentWork' }];
    }

    return [];
  },
}));

jest.mock('@/components/shared', () => ({
  SelectField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid={`select-${name}`}>{label}</div>
  ),
}));

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Button: ({
      children,
      onClick,
      type = 'button',
      ...props
    }: {
      children?: ReactNode;
      onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
      type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
    } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick' | 'type'>) => (
      <button type={type} onClick={onClick} {...props}>
        {children}
      </button>
    ),
    Notification: ({ children, label }: { children?: ReactNode; label?: string }) => (
      <section>
        {label ? <h2>{label}</h2> : null}
        {children}
      </section>
    ),
    Tooltip: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  };
});

function setupHandoverFinalizingForm(
  constructionHandoverOverrides = {},
  projectOverrides = {},
  preloadedState = withMockAuthUserAdGroups(
    [UserRole.CONSTRUCTION_MANAGEMENT_LEAD],
    { email: 'construction@example.com' },
    {},
  ),
) {
  const constructionHandover = createConstructionHandover(constructionHandoverOverrides);
  const project = createProject({
    personConstruction: {
      id: 'person-construction-1',
      firstName: 'Construction',
      lastName: 'Responsible',
      email: 'construction@example.com',
      title: 'Construction lead',
      phone: '0400000000',
    },
    ...projectOverrides,
  });

  return renderWithProviders(
    <Route
      path="/"
      element={
        <HandoverFinalizingForm constructionHandover={constructionHandover} project={project} />
      }
    />,
    {
      preloadedState,
    },
  );
}

describe('HandoverFinalizingForm', () => {
  beforeEach(() => {
    mockPatchConstructionHandover.mockClear();
  });

  it('shows project manager select only for SUBMITTED_TO_CONSTRUCTION status', async () => {
    await act(async () =>
      setupHandoverFinalizingForm({
        status: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
        constructionProjectManager: {
          id: 'manager-1',
          firstName: 'Matti',
          lastName: 'Meikalainen',
          email: 'matti.meikalainen@example.com',
          title: 'Project Manager',
          phone: '0401234567',
        },
      }),
    );

    expect(screen.getByTestId('select-constructionProjectManager')).toBeInTheDocument();
    expect(screen.getByTestId('select-constructionProcurementMethod')).toBeInTheDocument();
    expect(screen.getByText('constructionHandoverForm.projectManagerSet')).toBeInTheDocument();
  });

  it('submits project manager and procurement method when status is SUBMITTED_TO_CONSTRUCTION', async () => {
    await act(async () =>
      setupHandoverFinalizingForm({
        status: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
        constructionProjectManager: {
          id: 'manager-1',
          firstName: 'Matti',
          lastName: 'Meikalainen',
          email: 'matti.meikalainen@example.com',
          title: 'Project Manager',
          phone: '0401234567',
        },
        constructionProcurementMethod: {
          id: 'method-1',
          value: 'Stara',
        },
        staraProcurementReason: {
          id: 'reason-1',
          value: 'urgentWork',
        },
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'constructionHandoverForm.saveProjectManagerButton',
      }),
    );

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledWith({
        id: 'handover-1',
        data: {
          constructionProjectManager: 'manager-1',
          constructionProcurementMethod: 'method-1',
          staraProcurementReason: 'reason-1',
        },
      });
    });
  });

  it('omits procurement method from payload when status is SUBMITTED_TO_CONSTRUCTION and select is empty', async () => {
    await act(async () =>
      setupHandoverFinalizingForm({
        status: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
        constructionProjectManager: {
          id: 'manager-1',
          firstName: 'Matti',
          lastName: 'Meikalainen',
          email: 'matti.meikalainen@example.com',
          title: 'Project Manager',
          phone: '0401234567',
        },
        constructionProcurementMethod: null,
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'constructionHandoverForm.saveProjectManagerButton',
      }),
    );

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledTimes(1);
    });

    const requestPayload = mockPatchConstructionHandover.mock.calls[0][0];

    expect(requestPayload).toEqual({
      id: 'handover-1',
      data: {
        constructionProjectManager: 'manager-1',
      },
    });
    expect(requestPayload.data).not.toHaveProperty('constructionProcurementMethod');
  });

  it('submits only procurement method when status is PROJECT_MANAGER_NAMED', async () => {
    await act(async () =>
      setupHandoverFinalizingForm({
        status: ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
        constructionProcurementMethod: {
          id: 'method-1',
          value: 'Procurement Method',
        },
      }),
    );

    expect(screen.queryByTestId('select-constructionProjectManager')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'constructionHandoverForm.moveToConstructionPreparationButton',
      }),
    );

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledWith({
        id: 'handover-1',
        data: {
          constructionProcurementMethod: 'method-1',
        },
      });
    });
  });

  it('disables the save button when status is SUBMITTED_TO_CONSTRUCTION and user is not in the CONSTRUCTION_MANAGEMENT_LEAD group', async () => {
    await act(async () =>
      setupHandoverFinalizingForm(
        {
          status: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
        },
        {},
        withMockAuthUserAdGroups([UserRole.PROJECT_MANAGER], { email: 'construction@example.com' }),
      ),
    );

    const saveButton = await screen.findByRole('button', {
      name: 'constructionHandoverForm.saveProjectManagerButton',
    });

    expect(saveButton).toBeDisabled();
  });

  it('disables the save button when status is PROJECT_MANAGER_NAMED and user is not the construction responsible person for the project', async () => {
    await act(async () =>
      setupHandoverFinalizingForm(
        {
          status: ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
        },
        {
          personConstruction: {
            id: 'person-construction-1',
            firstName: 'Construction',
            lastName: 'Responsible',
            email: 'construction@example.com',
          },
        },
        withMockAuthUserAdGroups([UserRole.PLANNER], { email: 'otherperson@example.com' }),
      ),
    );

    const saveButton = await screen.findByRole('button', {
      name: 'constructionHandoverForm.moveToConstructionPreparationButton',
    });

    expect(saveButton).toBeDisabled();
  });
});
