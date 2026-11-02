import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FinancingDialog from './FinancingDialog';

const mockDispatch = vi.fn();
const mockPostFinancingRow = vi.fn();
const mockPatchFinancingRow = vi.fn();
const mockDeleteFinancingRow = vi.fn();

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());

vi.mock('@/hooks/common', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('@/hooks/useOptions', () => ({
  useOptions: (name?: string) => {
    if (name === 'financingParties') {
      return [
        { value: 'KYMP', label: 'KYMP-rahoitus' },
        { value: 'OTHER', label: 'Muu rahoitus' },
      ];
    }

    if (name === 'typeQualifiers') {
      return [{ value: 'K1', label: 'K1' }];
    }

    return [];
  },
}));

vi.mock('@/hooks/useGetProject', () => ({
  __esModule: true,
  default: () => ({ data: { id: 'project-123' } }),
}));

vi.mock('@/api/constructionHandoverApi', () => ({
  usePostConstructionHandoverFinancingMutation: () => [
    (request: unknown) => ({ unwrap: () => mockPostFinancingRow(request) }),
  ],
  usePatchConstructionHandoverFinancingMutation: () => [
    ({ id, request }: { id: string; request: unknown }) => ({
      unwrap: () => mockPatchFinancingRow(request, id),
    }),
  ],
  useDeleteConstructionHandoverFinancingMutation: () => [
    (id: string) => ({ unwrap: () => mockDeleteFinancingRow(id) }),
  ],
}));

describe('FinancingDialog', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockPostFinancingRow.mockReset();
    mockPatchFinancingRow.mockReset();
    mockDeleteFinancingRow.mockReset();
  });

  it('uses dialog values for add flow and only reads id from save response', async () => {
    const user = userEvent.setup();
    const onRowSaved = vi.fn();
    const handleClose = vi.fn();

    mockPostFinancingRow.mockResolvedValue({
      id: 'created-42',
      financingParty: { id: 'KYMP' },
      projectNumber: 'API-CHANGED',
      budget: 999999,
      description: 'API description',
    });

    render(
      <FinancingDialog
        handleClose={handleClose}
        dialogState={{
          open: true,
          mode: 'add',
          itemId: '',
          values: {
            financer: 'OTHER',
            description: 'Local description',
            budgetItem: '',
            projectNumber: '',
            budget: '123',
            id: '',
          },
        }}
        onRowSaved={onRowSaved}
        onRowDeleted={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-description-input'), {
      target: { value: 'Local description' },
    });

    await user.click(screen.getByTestId('submit-financing-row-button'));

    await waitFor(() => {
      expect(mockPostFinancingRow).toHaveBeenCalledWith({
        financingParty: 'OTHER',
        description: 'Local description',
        budgetItemId: '',
        projectNumber: '',
        budget: '123.00',
        project: 'project-123',
      });
    });

    await waitFor(() => {
      expect(onRowSaved).toHaveBeenCalledWith(
        {
          financer: 'OTHER',
          description: 'Local description',
          budgetItem: '',
          projectNumber: '',
          budget: '123,00€',
          id: 'created-42',
        },
        'add',
      );
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('uses local edited values in edit flow instead of remapping response payload', async () => {
    const user = userEvent.setup();
    const onRowSaved = vi.fn();

    mockPatchFinancingRow.mockResolvedValue({
      id: 'row-1',
      financingParty: { id: 'KYMP' },
      description: 'API edited description',
      budget: 987,
    });

    render(
      <FinancingDialog
        handleClose={vi.fn()}
        dialogState={{
          open: true,
          mode: 'edit',
          itemId: 'row-1',
          values: {
            financer: 'OTHER',
            description: 'Before edit',
            budgetItem: '',
            projectNumber: '',
            budget: '100',
            id: 'row-1',
          },
        }}
        onRowSaved={onRowSaved}
        onRowDeleted={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-description-input'), {
      target: { value: 'Edited locally' },
    });

    await user.click(screen.getByTestId('submit-financing-row-button'));

    await waitFor(() => {
      expect(mockPatchFinancingRow).toHaveBeenCalledWith(
        {
          financingParty: 'OTHER',
          description: 'Edited locally',
          budgetItemId: '',
          projectNumber: '',
          budget: '100.00',
          project: 'project-123',
        },
        'row-1',
      );
    });

    await waitFor(() => {
      expect(onRowSaved).toHaveBeenCalledWith(
        {
          financer: 'OTHER',
          description: 'Edited locally',
          budgetItem: '',
          projectNumber: '',
          budget: '100,00€',
          id: 'row-1',
        },
        'edit',
      );
    });
  });

  it('normalizes formatted budget value to decimal string in request payload', async () => {
    const user = userEvent.setup();
    mockPostFinancingRow.mockResolvedValue({ id: 'created-43' });

    render(
      <FinancingDialog
        handleClose={vi.fn()}
        dialogState={{
          open: true,
          mode: 'add',
          itemId: '',
          values: {
            financer: 'OTHER',
            description: 'Formatted budget row',
            budgetItem: '',
            projectNumber: '',
            budget: '1 000,5€',
            id: '',
          },
        }}
        onRowSaved={vi.fn()}
        onRowDeleted={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-description-input'), {
      target: { value: 'Formatted budget row' },
    });

    await user.click(screen.getByTestId('submit-financing-row-button'));

    await waitFor(() => {
      expect(mockPostFinancingRow).toHaveBeenCalledWith({
        financingParty: 'OTHER',
        description: 'Formatted budget row',
        budgetItemId: '',
        projectNumber: '',
        budget: '1000.50',
        project: 'project-123',
      });
    });
  });

  it('updates budget value from input edits before submit', async () => {
    const user = userEvent.setup();
    mockPatchFinancingRow.mockResolvedValue({ id: 'row-2' });

    render(
      <FinancingDialog
        handleClose={vi.fn()}
        dialogState={{
          open: true,
          mode: 'edit',
          itemId: 'row-2',
          values: {
            financer: 'OTHER',
            description: 'Editable budget',
            budgetItem: '',
            projectNumber: '',
            budget: '100',
            id: 'row-2',
          },
        }}
        onRowSaved={vi.fn()}
        onRowDeleted={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-budget-input'), {
      target: { value: '250,75€' },
    });

    await user.click(screen.getByTestId('submit-financing-row-button'));

    await waitFor(() => {
      expect(mockPatchFinancingRow).toHaveBeenCalledWith(
        {
          financingParty: 'OTHER',
          description: 'Editable budget',
          budgetItemId: '',
          projectNumber: '',
          budget: '250.75',
          project: 'project-123',
        },
        'row-2',
      );
    });
  });
});
