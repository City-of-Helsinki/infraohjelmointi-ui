import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProjectProgrammeStatusTransitionButtons from './ProjectProgrammeStatusTransitionButtons';

const mockDispatch = vi.fn();
const mockTransitionProjectProgrammeStatus = vi.fn();
const mockIsConfirmed = vi.fn();

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());

vi.mock('@/hooks/useConfirmDialog', () => ({
  __esModule: true,
  default: () => ({ isConfirmed: mockIsConfirmed }),
}));

vi.mock('@/hooks/common', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('@/api/projectProgrammeApi', () => ({
  useTransitionProjectProgrammeStatusMutation: () => [
    (...args: unknown[]) => ({
      unwrap: () => mockTransitionProjectProgrammeStatus(...args),
    }),
  ],
}));

describe('ProjectProgrammeStatusTransitionButtons', () => {
  const filledProgramme = {
    id: 'programme-1',
    locationMap: { id: 'map-1', url: '/map.png', originalName: 'map.png' },
    basicInfo: {
      projectName: 'Project',
      district: 'District',
      projectProgrammeCompiler: 'Compiler',
      estimatedCosts: '100000',
      summary: 'Summary',
      status: 'DRAFT' as const,
    },
  };
  beforeEach(() => {
    mockDispatch.mockReset();
    mockTransitionProjectProgrammeStatus.mockReset();
    mockTransitionProjectProgrammeStatus.mockResolvedValue({ currentStatus: 'COMPLETE' });
    mockIsConfirmed.mockReset();
    mockIsConfirmed.mockResolvedValue(true);
  });

  it('transitions a draft programme to complete and reports success', async () => {
    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
        effectiveProjectProgramme={filledProgramme}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markReady' }));

    await waitFor(() => {
      expect(mockTransitionProjectProgrammeStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        to: 'COMPLETE',
      });
    });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            title: 'saveSuccess',
            message: 'projectProgrammeMarkReadySuccess',
          }),
        }),
      );
    });
  });

  it('transitions a complete programme back to draft and reports success', async () => {
    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={true}
        effectiveProjectProgrammeId="programme-1"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.returnToDraft' }));

    expect(mockIsConfirmed).toHaveBeenCalledWith({
      title: 'projectProgrammeForm.returnToDraftDialogTitle',
      description: 'projectProgrammeForm.returnToDraftDialogDescription',
      confirmButtonText: 'projectProgrammeForm.returnToDraftDialogConfirm',
    });
    await waitFor(() => {
      expect(mockTransitionProjectProgrammeStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        to: 'DRAFT',
      });
    });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            title: 'saveSuccess',
            message: 'projectProgrammeReturnToDraftSuccess',
          }),
        }),
      );
    });
  });

  it('does not return the programme to draft when the confirmation is cancelled', async () => {
    mockIsConfirmed.mockResolvedValue(false);

    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={true}
        effectiveProjectProgrammeId="programme-1"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.returnToDraft' }));

    await waitFor(() => expect(mockIsConfirmed).toHaveBeenCalled());
    expect(mockTransitionProjectProgrammeStatus).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('reports an error when the transition fails', async () => {
    mockTransitionProjectProgrammeStatus.mockRejectedValue(new Error('transition failed'));

    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
        effectiveProjectProgramme={filledProgramme}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markReady' }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            title: 'saveError',
            message: 'projectProgrammeMarkReadyError',
          }),
        }),
      );
    });
  });

  it('blocks the API call and reports sections with missing required fields', () => {
    const onMissingRequiredFields = vi.fn();
    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
        effectiveProjectProgramme={{
          ...filledProgramme,
          basicInfo: { ...filledProgramme.basicInfo, summary: '  ', status: 'DRAFT' },
        }}
        onMissingRequiredFields={onMissingRequiredFields}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markReady' }));
    expect(mockTransitionProjectProgrammeStatus).not.toHaveBeenCalled();
    expect(onMissingRequiredFields).toHaveBeenCalledWith(['basicInfo']);
  });

  it('does not revalidate completed sections when completing the programme', async () => {
    const onMissingRequiredFields = vi.fn();
    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
        effectiveProjectProgramme={{
          ...filledProgramme,
          basicInfo: { status: 'COMPLETE' },
        }}
        onMissingRequiredFields={onMissingRequiredFields}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markReady' }));

    await waitFor(() =>
      expect(mockTransitionProjectProgrammeStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        to: 'COMPLETE',
      }),
    );
    expect(onMissingRequiredFields).not.toHaveBeenCalled();
  });
});
