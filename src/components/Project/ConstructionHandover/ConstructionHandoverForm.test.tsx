import mockI18next from '@/mocks/mockI18next';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders, withMockAuthUserAdGroups } from '@/utils/testUtils';
import { Route } from 'react-router';
import { act } from 'react-dom/test-utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ConstructionHandoverForm from './ConstructionHandoverForm';
import { createConstructionHandover, createProject } from '@/mocks/createMocks';
import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';
import { UserRole } from '@/interfaces/userInterfaces';

const mockPatchConstructionHandover = jest.fn();
const mockTransitionConstructionHandoverStatus = jest.fn();
const mockPostHandoverAttachment = jest.fn();
const mockDeleteHandoverAttachment = jest.fn();
const mockIsConfirmed = jest.fn();

jest.mock('@/api/constructionHandoverApi', () => ({
  usePatchConstructionHandoverMutation: () => [mockPatchConstructionHandover],
  useTransitionConstructionHandoverStatusMutation: () => [mockTransitionConstructionHandoverStatus],
  usePostConstructionHandoverFinancingMutation: () => [jest.fn()],
  usePatchConstructionHandoverFinancingMutation: () => [jest.fn()],
  useDeleteConstructionHandoverFinancingMutation: () => [jest.fn()],
  usePostHandoverAttachmentMutation: () => [mockPostHandoverAttachment, { isLoading: false }],
  useDeleteHandoverAttachmentMutation: () => [mockDeleteHandoverAttachment],
}));

jest.mock('@/hooks/useConfirmDialog', () => ({
  __esModule: true,
  default: () => ({
    isConfirmed: mockIsConfirmed,
  }),
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

function setupConstructionHandoverForm(
  constructionHandoverOverrides = {},
  projectOverrides = {},
  preloadedState = {},
) {
  const constructionHandover = createConstructionHandover({
    linkDesignDrawings: 'https://example.com/design-drawings',
    linkCostAllocation: 'https://example.com/cost-allocation',
    linkContractBoundaries: 'https://example.com/contract-boundaries',
    ...constructionHandoverOverrides,
  });
  const project = createProject(projectOverrides);

  return renderWithProviders(
    <Route
      path="/"
      element={
        <ConstructionHandoverForm constructionHandover={constructionHandover} project={project} />
      }
    />,
    {
      preloadedState,
    },
  );
}

describe('ConstructionHandoverForm copy link', () => {
  it('copies to clipboard and dispatches success notification when copy button is clicked', async () => {
    const { store } = await act(async () => setupConstructionHandoverForm());

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
    const { store } = await act(async () => setupConstructionHandoverForm());

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
    await act(async () =>
      setupConstructionHandoverForm({
        constructionStart: '2026-01-01',
        constructionEnd: '2026-02-01',
      }),
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
          staraProcurementReason: '',
          constructionStart: '01.01.2026',
          constructionEnd: '01.02.2026',
          otherTimelineNotes: '',
          personPlanning: 'person-1',
          personFinancing: 'person-2',
          totalCost: null,
          linkDesignDrawings: 'https://example.com/design-drawings',
          linkCostAllocation: 'https://example.com/cost-allocation',
          linkContractBoundaries: 'https://example.com/contract-boundaries',
        },
      });
    });
  });

  it('maps totalCost as number when untouched form has initial value', async () => {
    await act(async () =>
      setupConstructionHandoverForm({
        constructionStart: '2026-01-01',
        constructionEnd: '2026-02-01',
        totalCost: 75000,
      }),
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
    await act(async () =>
      setupConstructionHandoverForm({
        constructionStart: '2026-01-01',
        constructionEnd: '2026-02-01',
        totalCost: null,
      }),
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
    await act(async () =>
      setupConstructionHandoverForm({
        constructionStart: '2026-01-01',
        constructionEnd: '2026-02-01',
        totalCost: Number.NaN,
      }),
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
    await act(async () =>
      setupConstructionHandoverForm({
        constructionStart: '2026-01-01',
        constructionEnd: '2026-02-01',
        totalCost: null,
      }),
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
    await act(async () =>
      setupConstructionHandoverForm({
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
      }),
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
    mockPatchConstructionHandover.mockClear();
  });

  it('disables form fields when handover status is not draft or submitted to programmer', async () => {
    await act(async () =>
      setupConstructionHandoverForm({
        status: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
      }),
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
    const projectOverrides = {
      personPlanning: {
        id: 'person-1',
        firstName: 'Planner',
        lastName: 'User',
        email: 'planner@example.com',
        title: '',
        phone: '123456789',
      },
    };

    await act(async () =>
      setupConstructionHandoverForm(
        {
          status: ConstructionHandoverStatus.DRAFT,
        },
        projectOverrides,
        withMockAuthUserAdGroups([UserRole.PROJECT_MANAGER], {
          email: 'planner@example.com',
        }),
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

  it('does not submit handover to programmer when patching draft changes fails', async () => {
    const unwrap = jest.fn().mockRejectedValue(new Error('Patch failed'));
    mockPatchConstructionHandover.mockReturnValue({ unwrap });

    const projectOverrides = {
      personPlanning: {
        id: 'person-1',
        firstName: 'Planner',
        lastName: 'User',
        email: 'planner@example.com',
        title: '',
        phone: '123456789',
      },
    };

    await act(async () =>
      setupConstructionHandoverForm(
        {
          status: ConstructionHandoverStatus.DRAFT,
        },
        projectOverrides,
        withMockAuthUserAdGroups([UserRole.PROJECT_MANAGER], {
          email: 'planner@example.com',
        }),
      ),
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /constructionHandoverForm\.name/i }), {
        target: { value: 'Updated handover name' },
      });
    });

    const submitToProgrammerButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.submitToProgrammer',
    });

    await act(async () => {
      fireEvent.click(submitToProgrammerButton);
    });

    await waitFor(() => {
      expect(mockPatchConstructionHandover).toHaveBeenCalled();
      expect(mockTransitionConstructionHandoverStatus).not.toHaveBeenCalled();
    });
  });

  it('hides submit to programmer button when user is not the planning responsible person of related project', async () => {
    const projectOverrides = {
      personPlanning: {
        id: 'person-1',
        firstName: 'Planner',
        lastName: 'User',
        email: 'planner@example.com',
        title: '',
        phone: '123456789',
      },
    };

    setupConstructionHandoverForm(
      {},
      projectOverrides,
      withMockAuthUserAdGroups([UserRole.PROJECT_MANAGER], {
        email: 'otheruser@example.com',
      }),
    );

    expect(
      screen.queryByRole('button', { name: 'constructionHandoverForm.submitToProgrammer' }),
    ).not.toBeInTheDocument();
  });

  it('hides submit to programmer button when user is not in PROJECT_MANAGER role', async () => {
    const projectOverrides = {
      personPlanning: {
        id: 'person-1',
        firstName: 'Planner',
        lastName: 'User',
        email: 'planner@example.com',
        title: '',
        phone: '123456789',
      },
    };

    setupConstructionHandoverForm(
      {},
      projectOverrides,
      withMockAuthUserAdGroups([UserRole.CONSTRUCTION_MANAGEMENT_LEAD], {
        email: 'planner@example.com',
      }),
    );

    expect(
      screen.queryByRole('button', { name: 'constructionHandoverForm.submitToProgrammer' }),
    ).not.toBeInTheDocument();
  });

  it('submits handover to construction when submit to construction button is clicked', async () => {
    await act(async () =>
      setupConstructionHandoverForm(
        {
          status: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
        },
        {},
        withMockAuthUserAdGroups([UserRole.PLANNER]),
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

  it('hides submit to construction button when user is not in PLANNER role', async () => {
    setupConstructionHandoverForm(
      {
        status: ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
      },
      {},
      withMockAuthUserAdGroups([UserRole.PROJECT_MANAGER]),
    );

    expect(
      screen.queryByRole('button', { name: 'constructionHandoverForm.submitToConstruction' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
    ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
    ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION,
  ])('shows return to draft button for %s status', async (status) => {
    await act(async () => setupConstructionHandoverForm({ status }));

    expect(
      screen.getByRole('button', { name: 'constructionHandoverForm.returnToDraft' }),
    ).toBeInTheDocument();
  });

  it.each([ConstructionHandoverStatus.DRAFT, ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER])(
    'hides return to draft button for %s status',
    async (status) => {
      await act(async () => setupConstructionHandoverForm({ status }));

      expect(
        screen.queryByRole('button', { name: 'constructionHandoverForm.returnToDraft' }),
      ).toBeNull();
    },
  );

  it('returns handover to draft when return to draft button is clicked', async () => {
    await act(async () =>
      setupConstructionHandoverForm({
        status: ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
      }),
    );

    const returnToDraftButton = screen.getByRole('button', {
      name: 'constructionHandoverForm.returnToDraft',
    });

    await act(async () => {
      fireEvent.click(returnToDraftButton);
    });

    await waitFor(() => {
      expect(mockTransitionConstructionHandoverStatus).toHaveBeenCalledWith({
        id: 'handover-1',
        to: ConstructionHandoverStatus.DRAFT,
      });
    });
  });
});

describe('ConstructionHandoverForm attachments and links', () => {
  const attachment = {
    id: 'attachment-1',
    handover: 'handover-1',
    downloadUrl: '/construction-handovers/handover-1/attachments/attachment-1/download/',
    objectUrl: 'blob:first',
    originalName: 'first-image.jpg',
    contentType: 'image/jpeg' as const,
    size: 2048,
    uploadedDate: '2026-01-01T12:00:00Z',
    order: 0,
  };

  beforeEach(() => {
    mockPatchConstructionHandover.mockReset();
    mockPatchConstructionHandover.mockReturnValue({ unwrap: () => Promise.resolve() });
    mockPostHandoverAttachment.mockReset();
    mockPostHandoverAttachment.mockResolvedValue({ data: [] });
    mockDeleteHandoverAttachment.mockReset();
    mockIsConfirmed.mockReset();
  });

  async function clickSaveDraft() {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'constructionHandoverForm.saveDraft' }));
    });
  }

  it('uploads all selected files in a single request after saving', async () => {
    await act(async () => setupConstructionHandoverForm());

    const files = [
      new File(['first'], 'new-first.jpg', { type: 'image/jpeg' }),
      new File(['second'], 'new-second.png', { type: 'image/png' }),
    ];

    await act(async () => {
      fireEvent.change(screen.getByLabelText('attachments.dragAndDrop'), {
        target: { files },
      });
    });

    await clickSaveDraft();

    await waitFor(() => expect(mockPostHandoverAttachment).toHaveBeenCalledTimes(1));
    const { handoverId, formData } = mockPostHandoverAttachment.mock.calls[0][0] as {
      handoverId: string;
      formData: FormData;
    };
    expect(handoverId).toBe('handover-1');
    expect((formData.getAll('file') as File[]).map((file) => file.name)).toEqual([
      'new-first.jpg',
      'new-second.png',
    ]);
  });

  it('does not upload attachments when no files are selected', async () => {
    await act(async () => setupConstructionHandoverForm());

    await clickSaveDraft();

    await waitFor(() => expect(mockPatchConstructionHandover).toHaveBeenCalled());
    expect(mockPostHandoverAttachment).not.toHaveBeenCalled();
  });

  it('does not upload attachments when saving the handover fails', async () => {
    mockPatchConstructionHandover.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Patch failed')),
    });
    await act(async () => setupConstructionHandoverForm());

    await act(async () => {
      fireEvent.change(screen.getByLabelText('attachments.dragAndDrop'), {
        target: { files: [new File(['first'], 'new-first.jpg', { type: 'image/jpeg' })] },
      });
    });

    await clickSaveDraft();

    await waitFor(() => expect(mockPatchConstructionHandover).toHaveBeenCalled());
    expect(mockPostHandoverAttachment).not.toHaveBeenCalled();
  });

  it.each(['linkDesignDrawings', 'linkCostAllocation', 'linkContractBoundaries'])(
    'does not submit when required link %s is empty',
    async (linkField) => {
      await act(async () => setupConstructionHandoverForm({ [linkField]: null }));

      await clickSaveDraft();

      expect(await screen.findByText('validation.required')).toBeInTheDocument();
      expect(mockPatchConstructionHandover).not.toHaveBeenCalled();
    },
  );

  it('renders every attachment of the handover', async () => {
    await act(async () =>
      setupConstructionHandoverForm({
        attachments: [
          attachment,
          { ...attachment, id: 'attachment-2', originalName: 'second-image.png' },
        ],
      }),
    );

    expect(screen.getByText(/first-image\.jpg/)).toBeInTheDocument();
    expect(screen.getByText(/second-image\.png/)).toBeInTheDocument();
  });

  it('deletes an attachment after confirmation', async () => {
    mockIsConfirmed.mockResolvedValue(true);
    await act(async () => setupConstructionHandoverForm({ attachments: [attachment] }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'attachments.delete' }));
    });

    await waitFor(() =>
      expect(mockDeleteHandoverAttachment).toHaveBeenCalledWith({
        handoverId: 'handover-1',
        attachmentId: 'attachment-1',
      }),
    );
  });
});
