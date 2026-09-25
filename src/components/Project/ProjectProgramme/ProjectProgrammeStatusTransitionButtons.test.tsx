import mockI18next from '@/mocks/mockI18next';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProjectProgrammeStatusTransitionButtons from './ProjectProgrammeStatusTransitionButtons';

const mockDispatch = jest.fn();
const mockTransitionProjectProgrammeStatus = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/common', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/api/projectProgrammeApi', () => ({
  useTransitionProjectProgrammeStatusMutation: () => [
    (...args: unknown[]) => ({
      unwrap: () => mockTransitionProjectProgrammeStatus(...args),
    }),
  ],
}));

describe('ProjectProgrammeStatusTransitionButtons', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockTransitionProjectProgrammeStatus.mockReset();
    mockTransitionProjectProgrammeStatus.mockResolvedValue({ currentStatus: 'COMPLETE' });
  });

  it('transitions a draft programme to complete and reports success', async () => {
    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
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

  it('reports an error when the transition fails', async () => {
    mockTransitionProjectProgrammeStatus.mockRejectedValue(new Error('transition failed'));

    render(
      <ProjectProgrammeStatusTransitionButtons
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
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
});
