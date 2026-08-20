import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Route } from 'react-router';
import { act } from 'react-dom/test-utils';
import FinancingSection from './FinancingSection';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';

jest.mock('react-i18next', () => mockI18next());

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

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
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
    Table: ({ rows }: { rows: Array<Record<string, ReactNode>> }) => (
      <table data-testid="financing-table">
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)}>
              {Object.entries(row).map(([key, value]) => (
                <td key={`${String(row.id)}-${key}`}>{value as ReactNode}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
  };
});

jest.mock('./FinancingDialog', () => ({
  __esModule: true,
  default: ({
    onRowSaved,
    onRowDeleted,
  }: {
    onRowSaved: (
      row: {
        financer: string;
        description: string;
        budgetItem: string;
        projectNumber: string;
        budget: string;
        id: string;
      },
      mode: 'add' | 'edit' | 'delete',
    ) => void;
    onRowDeleted: (id: string) => void;
  }) => (
    <div>
      <button
        data-testid="mock-save-add"
        onClick={() =>
          onRowSaved(
            {
              id: 'added-row',
              financer: 'OTHER',
              description: 'Added external funding',
              budgetItem: '',
              projectNumber: 'HEL-NEW-001',
              budget: '12345',
            },
            'add',
          )
        }
      >
        save add
      </button>
      <button
        data-testid="mock-save-edit"
        onClick={() =>
          onRowSaved(
            {
              id: 'row-1',
              financer: 'OTHER',
              description: 'Edited external funding',
              budgetItem: '',
              projectNumber: 'HEL-EDIT-001',
              budget: '55555',
            },
            'edit',
          )
        }
      >
        save edit
      </button>
      <button data-testid="mock-delete-row-1" onClick={() => onRowDeleted('row-1')}>
        delete row 1
      </button>
    </div>
  ),
}));

const defaultValues: IConstructionHandoverForm = {
  id: 'handover-1',
  name: 'Test Handover',
  description: 'Description',
  constructionProcurementMethod: { label: 'Method', value: 'method-1' },
  constructionStart: null,
  constructionEnd: null,
  otherTimelineNotes: '',
  constructionHandoverFinancing: [],
  personPlanning: { label: 'Planner', value: 'planner-1' },
  personFinancing: { label: 'Financer', value: 'financer-1' },
  totalCost: '',
};

const renderSection = async (
  financingRows: IConstructionHandoverForm['constructionHandoverFinancing'] = [],
) => {
  const TestForm = () => {
    const formMethods = useForm<IConstructionHandoverForm>({
      defaultValues: {
        ...defaultValues,
        constructionHandoverFinancing: financingRows,
      },
    });

    return (
      <FormProvider {...formMethods}>
        <FinancingSection handoverStatus={ConstructionHandoverStatus.DRAFT} />
      </FormProvider>
    );
  };

  return act(async () => renderWithProviders(<Route path="/" element={<TestForm />} />));
};

describe('FinancingSection', () => {
  it('adds a financing row via onRowSaved add flow', async () => {
    await renderSection();

    fireEvent.click(screen.getByTestId('addFinancing-button'));
    fireEvent.click(screen.getByTestId('mock-save-add'));

    await waitFor(() => {
      expect(screen.getByText('HEL-NEW-001')).toBeInTheDocument();
      expect(screen.getByText('12 345,00€')).toBeInTheDocument();
    });
  });

  it('edits an existing financing row via onRowSaved edit flow', async () => {
    await renderSection([
      {
        id: 'row-1',
        financer: 'OTHER',
        description: 'Before edit',
        budgetItem: '',
        projectNumber: 'HEL-OLD-001',
        budget: '1000',
      },
    ]);

    expect(screen.getByText('HEL-OLD-001')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-save-edit'));

    await waitFor(() => {
      expect(screen.getByText('HEL-EDIT-001')).toBeInTheDocument();
      expect(screen.queryByText('HEL-OLD-001')).not.toBeInTheDocument();
    });
  });

  it('deletes an existing financing row via onRowDeleted flow', async () => {
    await renderSection([
      {
        id: 'row-1',
        financer: 'OTHER',
        description: 'Delete me',
        budgetItem: '',
        projectNumber: 'HEL-DEL-001',
        budget: '1000',
      },
    ]);

    expect(screen.getByText('HEL-DEL-001')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-delete-row-1'));

    await waitFor(() => {
      expect(screen.queryByText('HEL-DEL-001')).not.toBeInTheDocument();
    });
  });

  it('groups multiple KYMP rows behind expandable main row', async () => {
    await renderSection([
      {
        id: 'kymp-1',
        financer: 'KYMP',
        description: '',
        budgetItem: 'K1',
        projectNumber: 'HEL-KYMP-001',
        budget: '1000',
      },
      {
        id: 'kymp-2',
        financer: 'KYMP',
        description: '',
        budgetItem: 'K1',
        projectNumber: 'HEL-KYMP-002',
        budget: '2000',
      },
    ]);

    expect(screen.getByText('KYMP-rahoitus')).toBeInTheDocument();
    expect(screen.queryByText('HEL-KYMP-001')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'KYMP-rahoitus' }));

    await waitFor(() => {
      expect(screen.getByText('HEL-KYMP-001')).toBeInTheDocument();
      expect(screen.getByText('HEL-KYMP-002')).toBeInTheDocument();
    });
  });

  it('keeps backend-provided decimals', async () => {
    await renderSection([
      {
        id: 'row-decimal',
        financer: 'OTHER',
        description: 'Has decimals',
        budgetItem: '',
        projectNumber: 'HEL-DEC-001',
        budget: '1000.5',
      },
      {
        id: 'row-integer',
        financer: 'OTHER',
        description: 'No decimals',
        budgetItem: '',
        projectNumber: 'HEL-INT-001',
        budget: '2000',
      },
    ]);

    expect(screen.getByText('1 000,50€')).toBeInTheDocument();
    expect(screen.getByText('2 000,00€')).toBeInTheDocument();
  });

  it('formats total cost field value euro currency style', async () => {
    await renderSection();

    fireEvent.change(screen.getByLabelText('constructionHandoverForm.totalCost'), {
      target: { value: '1234567' },
    });
    fireEvent.blur(screen.getByLabelText('constructionHandoverForm.totalCost'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('1 234 567,00€')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('constructionHandoverForm.totalCost'), {
      target: { value: '1000.5' },
    });
    fireEvent.blur(screen.getByLabelText('constructionHandoverForm.totalCost'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('1 000,50€')).toBeInTheDocument();
    });
  });
});
