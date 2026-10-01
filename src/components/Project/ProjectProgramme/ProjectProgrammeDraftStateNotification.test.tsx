import mockI18next from '@/mocks/mockI18next';
import { act, render, screen } from '@testing-library/react';
import { ButtonPresetTheme, ButtonVariant } from 'hds-react';
import ProjectProgrammeDraftStateNotification from './ProjectProgrammeDraftStateNotification';

const mockActionButtons = jest.fn();
const mockStatusTransitionButtons = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('./ProjectProgrammeActionButtons', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockActionButtons(props);
    return <div data-testid="project-programme-action-buttons" />;
  },
}));

jest.mock('./ProjectProgrammeStatusTransitionButtons', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockStatusTransitionButtons(props);
    return <div data-testid="project-programme-status-transition-buttons" />;
  },
}));

describe('ProjectProgrammeDraftStateNotification', () => {
  const onOpenSection = jest.fn();

  beforeEach(() => {
    onOpenSection.mockReset();
    mockActionButtons.mockReset();
    mockStatusTransitionButtons.mockReset();
  });

  it('renders draft state links and opens selected section', async () => {
    render(
      <ProjectProgrammeDraftStateNotification
        sectionsInCompletedState={[]}
        sectionsInDraftState={[
          { id: 'basicInfo', label: 'Basic info' },
          { id: 'designCriteria', label: 'Design criteria' },
        ]}
        onOpenSection={onOpenSection}
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
      />,
    );

    expect(screen.getByText('projectProgrammeForm.draftStateLabel')).toBeInTheDocument();
    expect(screen.getByText('projectProgrammeForm.draftStateSections')).toBeInTheDocument();

    await act(async () => {
      screen.getByRole('link', { name: 'Design criteria' }).click();
    });

    expect(onOpenSection).toHaveBeenCalledWith('designCriteria');
  });

  it('passes status and action button overrides to their respective components', () => {
    render(
      <ProjectProgrammeDraftStateNotification
        sectionsInCompletedState={[]}
        sectionsInDraftState={[{ id: 'basicInfo', label: 'Basic info' }]}
        onOpenSection={onOpenSection}
        isProjectProgrammeComplete={true}
        effectiveProjectProgrammeId="programme-123"
      />,
    );

    const statusButtonProps = mockStatusTransitionButtons.mock.calls[0][0];
    const actionButtonProps = mockActionButtons.mock.calls[0][0];

    expect(statusButtonProps).toEqual(
      expect.objectContaining({
        isProjectProgrammeComplete: true,
        effectiveProjectProgrammeId: 'programme-123',
        buttonOverrides: {
          markReady: {
            variant: ButtonVariant.Secondary,
            theme: ButtonPresetTheme.Black,
            style: { backgroundColor: 'var(--color-white)' },
          },
        },
      }),
    );
    expect(actionButtonProps).toEqual(
      expect.objectContaining({
        buttonOverrides: {
          copyLink: {
            theme: ButtonPresetTheme.Black,
            style: { backgroundColor: 'var(--color-white)' },
          },
          makePdf: {
            theme: ButtonPresetTheme.Black,
            style: { backgroundColor: 'var(--color-white)' },
          },
        },
      }),
    );
  });

  it('does not render section links when there are no draft sections', () => {
    render(
      <ProjectProgrammeDraftStateNotification
        sectionsInCompletedState={[]}
        sectionsInDraftState={[]}
        onOpenSection={onOpenSection}
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
      />,
    );

    expect(screen.queryByText('projectProgrammeForm.draftStateLabel')).toBeInTheDocument();
    expect(screen.queryByText('projectProgrammeForm.draftStateSections')).not.toBeInTheDocument();
  });

  it('renders completed sections above draft sections', () => {
    render(
      <ProjectProgrammeDraftStateNotification
        sectionsInCompletedState={[{ id: 'basicInfo', label: 'Basic info' }]}
        sectionsInDraftState={[{ id: 'designCriteria', label: 'Design criteria' }]}
        onOpenSection={onOpenSection}
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
      />,
    );

    const completedText = screen.getByText('projectProgrammeForm.completedStateSections');
    const draftText = screen.getByText('projectProgrammeForm.draftStateSections');

    expect(completedText.compareDocumentPosition(draftText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
