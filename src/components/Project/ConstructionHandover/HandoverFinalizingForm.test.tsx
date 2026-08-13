import mockI18next from '@/mocks/mockI18next';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import { act } from 'react-dom/test-utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import HandoverFinalizingForm from './HandoverFinalizingForm';
import { createConstructionHandover } from '@/mocks/createMocks';
import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';

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
      return [{ value: 'method-1', label: 'Procurement Method' }];
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
    }: {
      children?: ReactNode;
      onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
      type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
    }) => (
      <button type={type} onClick={onClick}>
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

describe('HandoverFinalizingForm', () => {
  beforeEach(() => {
    mockPatchConstructionHandover.mockClear();
  });

  it('shows project manager select only for SUBMITTED_TO_CONSTRUCTION status', async () => {
    const constructionHandover = createConstructionHandover({
      status: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
      constructionProjectManager: {
        id: 'manager-1',
        firstName: 'Matti',
        lastName: 'Meikalainen',
        email: 'matti.meikalainen@example.com',
        title: 'Project Manager',
        phone: '0401234567',
      },
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<HandoverFinalizingForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    expect(screen.getByTestId('select-constructionProjectManager')).toBeInTheDocument();
    expect(screen.getByTestId('select-constructionProcurementMethod')).toBeInTheDocument();
    expect(screen.getByText('constructionHandoverForm.projectManagerSet')).toBeInTheDocument();
  });

  it('submits project manager and procurement method when status is SUBMITTED_TO_CONSTRUCTION', async () => {
    const constructionHandover = createConstructionHandover({
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
        value: 'Procurement Method',
      },
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<HandoverFinalizingForm constructionHandover={constructionHandover} />}
        />,
      ),
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
        },
      });
    });
  });

  it('omits procurement method from payload when status is SUBMITTED_TO_CONSTRUCTION and select is empty', async () => {
    const constructionHandover = createConstructionHandover({
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
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<HandoverFinalizingForm constructionHandover={constructionHandover} />}
        />,
      ),
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
    const constructionHandover = createConstructionHandover({
      status: ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
      constructionProcurementMethod: {
        id: 'method-1',
        value: 'Procurement Method',
      },
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<HandoverFinalizingForm constructionHandover={constructionHandover} />}
        />,
      ),
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
});
