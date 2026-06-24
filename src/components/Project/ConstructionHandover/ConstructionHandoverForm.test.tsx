import mockI18next from '@/mocks/mockI18next';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import { Route } from 'react-router';
import { act } from 'react-dom/test-utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ConstructionHandoverForm from './ConstructionHandoverForm';
import { createConstructionHandover } from '@/mocks/createMocks';
import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';

const mockPatchConstructionHandover = jest.fn();
const mockTransitionConstructionHandoverStatus = jest.fn();

jest.mock('@/api/constructionHandoverApi', () => ({
  usePatchConstructionHandoverMutation: () => [mockPatchConstructionHandover],
  useTransitionConstructionHandoverStatusMutation: () => [mockTransitionConstructionHandoverStatus],
  usePostConstructionHandoverFinancingMutation: () => [jest.fn()],
  usePatchConstructionHandoverFinancingMutation: () => [jest.fn()],
  useDeleteConstructionHandoverFinancingMutation: () => [jest.fn()],
}));

jest.mock('react-i18next', () => mockI18next());

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
    IconLink: () => <span aria-hidden="true" />,
  };
});

describe('ConstructionHandoverForm copy link', () => {
  it('copies to clipboard and dispatches success notification when copy button is clicked', async () => {
    const constructionHandover = createConstructionHandover();

    const { store } = await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    const copyButton = screen.getByRole('button', { name: 'copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(window.location.href);
      expect(store.getState().notifications).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'linkCopied',
            message: 'linkCopiedToClipboard',
            type: 'toast',
            color: 'success',
            duration: 3500,
          }),
        ]),
      );
    });

    writeTextSpy.mockRestore();
  });

  it('dispatches error notification when clipboard write fails', async () => {
    const constructionHandover = createConstructionHandover();

    const { store } = await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const writeTextSpy = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Clipboard unavailable'));

    const copyButton = screen.getByRole('button', { name: 'copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(store.getState().notifications).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'undefined',
            message: 'linkCopyFailed',
            type: 'toast',
            color: 'error',
            duration: 3500,
          }),
        ]),
      );
    });

    writeTextSpy.mockRestore();
  });
});

describe('ConstructionHandoverForm submit', () => {
  beforeEach(() => {
    mockPatchConstructionHandover.mockClear();
  });

  it('submits form and calls patch mutation with mapped payload', async () => {
    const constructionHandover = createConstructionHandover({
      constructionStart: '2026-01-01',
      constructionEnd: '2026-02-01',
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const submitButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.saveDraft',
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledWith({
        id: 'handover-1',
        data: {
          name: 'Test Handover',
          description: 'This is a test construction handover.',
          constructionProcurementMethod: '',
          constructionStart: '01.01.2026',
          constructionEnd: '01.02.2026',
          otherTimelineNotes: '',
          personPlanning: 'person-1',
          personFinancing: 'person-2',
          totalCost: null,
          linkDesignDrawings: null,
          linkCostAllocation: null,
          linkContractBoundaries: null,
        },
      });
    });
  });

  it('maps totalCost as number when untouched form has initial value', async () => {
    const constructionHandover = createConstructionHandover({
      constructionStart: '2026-01-01',
      constructionEnd: '2026-02-01',
      totalCost: 75000,
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const submitButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.saveDraft',
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalCost: 75000,
          }),
        }),
      );
    });
  });

  it('maps totalCost as null when form field is empty', async () => {
    const constructionHandover = createConstructionHandover({
      constructionStart: '2026-01-01',
      constructionEnd: '2026-02-01',
      totalCost: null,
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const submitButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.saveDraft',
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalCost: null,
          }),
        }),
      );
    });
  });

  it('maps totalCost as null when value is not a valid number', async () => {
    const constructionHandover = createConstructionHandover({
      constructionStart: '2026-01-01',
      constructionEnd: '2026-02-01',
      totalCost: Number.NaN,
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const submitButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.saveDraft',
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalCost: null,
          }),
        }),
      );
    });
  });

  it('maps localized formatted totalCost value as number on submit', async () => {
    const constructionHandover = createConstructionHandover({
      constructionStart: '2026-01-01',
      constructionEnd: '2026-02-01',
      totalCost: null,
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    await act(async () => {
      fireEvent.change(screen.getByLabelText('constructionHandoverForm.totalCost'), {
        target: { value: '1000,5' },
      });
    });

    const submitButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.saveDraft',
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalCost: 1000.5,
          }),
        }),
      );
    });
  });
});

describe('ConstructionHandoverForm financing rows', () => {
  it('displays financing rows returned from API in table', async () => {
    const constructionHandover = createConstructionHandover({
      constructionHandoverFinancing: [
        {
          id: 'financing-1',
          financingParty: 'KYMP',
          description: '',
          budgetItem: { id: 'budget-1', value: 'K1' },
          projectNumber: 'HEL-2024-001',
          budget: '150000',
        },
      ],
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: /^KYMP/ }));

    await waitFor(() => {
      expect(screen.getByText('HEL-2024-001')).toBeInTheDocument();
    });
  });
});

describe('ConstructionHandoverForm status transitions', () => {
  beforeEach(() => {
    mockTransitionConstructionHandoverStatus.mockClear();
  });

  it('disables form fields when handover status is not draft', async () => {
    const constructionHandover = createConstructionHandover({
      status: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    expect(screen.getByRole('textbox', { name: /constructionHandoverForm\.name/i })).toBeDisabled();
    expect(
      screen.getByRole('textbox', { name: /constructionHandoverForm\.description/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole('textbox', { name: /constructionHandoverForm\.constructionStart/i }),
    ).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'constructionHandoverForm.saveDraft' })).toBeNull();
  });

  it('submits handover to programmer when submit to programmer button is clicked', async () => {
    const constructionHandover = createConstructionHandover({
      status: ConstructionHandoverStatus.DRAFT,
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const submitToProgrammerButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.submitToProgrammer',
    });

    await act(async () => {
      fireEvent.click(submitToProgrammerButton);
    });

    await waitFor(() => {
      expect(mockTransitionConstructionHandoverStatus).toHaveBeenCalledWith({
        id: 'handover-1',
        to: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
      });
    });
  });

  it('submits handover to construction when submit to construction button is clicked', async () => {
    const constructionHandover = createConstructionHandover({
      status: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
    });

    await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={<ConstructionHandoverForm constructionHandover={constructionHandover} />}
        />,
      ),
    );

    const submitToConstructionButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.submitToConstruction',
    });

    await act(async () => {
      fireEvent.click(submitToConstructionButton);
    });

    await waitFor(() => {
      expect(mockTransitionConstructionHandoverStatus).toHaveBeenCalledWith({
        id: 'handover-1',
        to: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
      });
    });
  });
});
