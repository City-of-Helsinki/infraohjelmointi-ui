import mockI18next from '@/mocks/mockI18next';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import FinancingDialog from './FinancingDialog';

const mockDispatch = jest.fn();
const mockPostFinancingRow = jest.fn();
const mockPatchFinancingRow = jest.fn();
const mockDeleteFinancingRow = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/common', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/hooks/useOptions', () => ({
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

jest.mock('@/hooks/useGetProject', () => ({
  __esModule: true,
  default: () => ({ data: { id: 'project-123' } }),
}));

jest.mock('@/api/constructionHandoverApi', () => ({
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
    const onRowSaved = jest.fn();
    const handleClose = jest.fn();

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
        onRowDeleted={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-description-input'), {
      target: { value: 'Local description' },
    });

    fireEvent.click(screen.getByTestId('submit-financing-row-button'));

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
    const onRowSaved = jest.fn();

    mockPatchFinancingRow.mockResolvedValue({
      id: 'row-1',
      financingParty: { id: 'KYMP' },
      description: 'API edited description',
      budget: 987,
    });

    render(
      <FinancingDialog
        handleClose={jest.fn()}
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
        onRowDeleted={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-description-input'), {
      target: { value: 'Edited locally' },
    });

    fireEvent.click(screen.getByTestId('submit-financing-row-button'));

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
    mockPostFinancingRow.mockResolvedValue({ id: 'created-43' });

    render(
      <FinancingDialog
        handleClose={jest.fn()}
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
        onRowSaved={jest.fn()}
        onRowDeleted={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-description-input'), {
      target: { value: 'Formatted budget row' },
    });

    fireEvent.click(screen.getByTestId('submit-financing-row-button'));

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
    mockPatchFinancingRow.mockResolvedValue({ id: 'row-2' });

    render(
      <FinancingDialog
        handleClose={jest.fn()}
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
        onRowSaved={jest.fn()}
        onRowDeleted={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-budget-input'), {
      target: { value: '250,75€' },
    });

    fireEvent.click(screen.getByTestId('submit-financing-row-button'));

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
