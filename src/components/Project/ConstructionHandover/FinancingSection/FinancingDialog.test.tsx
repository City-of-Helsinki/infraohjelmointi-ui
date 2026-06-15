import mockI18next from '@/mocks/mockI18next';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import FinancingDialog from './FinancingDialog';

const mockDispatch = jest.fn();
const mockPostFinancingRow = jest.fn();
const mockPatchFinancingRow = jest.fn();

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

jest.mock('@/services/constructionHandoverServices', () => ({
  postFinancingRow: (request: unknown) => mockPostFinancingRow(request),
  patchFinancingRow: (request: unknown, id: string) => mockPatchFinancingRow(request, id),
  deleteFinancingRow: jest.fn(),
}));

jest.mock('hds-react', () => {
  const Dialog = ({ isOpen, children }: { isOpen: boolean; children?: ReactNode }) =>
    isOpen ? <div>{children}</div> : null;
  Dialog.displayName = 'Dialog';

  const Header = ({ title }: { title?: ReactNode }) => <div>{title}</div>;
  Header.displayName = 'Dialog.Header';
  Dialog.Header = Header;

  const Content = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  Content.displayName = 'Dialog.Content';
  Dialog.Content = Content;

  const ActionButtons = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  ActionButtons.displayName = 'Dialog.ActionButtons';
  Dialog.ActionButtons = ActionButtons;

  return {
    Dialog,
    ButtonVariant: {
      Secondary: 'secondary',
    },
    Button: ({
      children,
      onClick,
      type = 'button',
      'data-testid': dataTestId,
    }: {
      children?: ReactNode;
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
      type?: 'button' | 'submit' | 'reset';
      'data-testid'?: string;
    }) => (
      <button type={type} onClick={onClick} data-testid={dataTestId}>
        {children}
      </button>
    ),
    Select: ({
      id,
      options,
      value,
      onChange,
    }: {
      id: string;
      options: Array<{ value: string; label: string }>;
      value?: Array<{ value: string; label: string }>;
      onChange?: (selectedOptions: unknown[], clickedOption?: { value: string; label: string }) => void;
    }) => (
      <select
        data-testid={id}
        value={value?.[0]?.value ?? ''}
        onChange={(e) => {
          const clickedOption = options.find((option) => option.value === e.target.value);
          onChange?.([], clickedOption);
        }}
      >
        <option value="">--</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    TextInput: ({
      id,
      value,
      onChange,
      'data-testid': dataTestId,
    }: {
      id: string;
      value?: string;
      onChange?: React.ChangeEventHandler<HTMLInputElement>;
      'data-testid'?: string;
    }) => <input id={id} data-testid={dataTestId ?? id} value={value ?? ''} onChange={onChange} />,
    Notification: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  };
});

describe('FinancingDialog', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockPostFinancingRow.mockReset();
    mockPatchFinancingRow.mockReset();
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
          values: undefined,
        }}
        onRowSaved={onRowSaved}
        onRowDeleted={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('financing-dialog-financer-select'), {
      target: { value: 'OTHER' },
    });
    fireEvent.change(screen.getByTestId('financing-dialog-description-input'), {
      target: { value: 'Local description' },
    });
    fireEvent.change(screen.getByTestId('financing-dialog-budget-input'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByTestId('submit-financing-row-button'));

    await waitFor(() => {
      expect(mockPostFinancingRow).toHaveBeenCalledWith({
        financingParty: 'OTHER',
        description: 'Local description',
        budgetItemId: '',
        projectNumber: '',
        budget: '123',
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
          budget: '123',
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
    fireEvent.change(screen.getByTestId('financing-dialog-budget-input'), {
      target: { value: '555' },
    });

    fireEvent.click(screen.getByTestId('submit-financing-row-button'));

    await waitFor(() => {
      expect(mockPatchFinancingRow).toHaveBeenCalledWith(
        {
          financingParty: 'OTHER',
          description: 'Edited locally',
          budgetItemId: '',
          projectNumber: '',
          budget: '555',
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
          budget: '555',
          id: 'row-1',
        },
        'edit',
      );
    });
  });
});
