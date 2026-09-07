import mockI18next from '@/mocks/mockI18next';
import { act, render, screen } from '@testing-library/react';
import { ButtonPresetTheme, ButtonVariant } from 'hds-react';
import ProjectProgrammeDraftStateNotification from './ProjectProgrammeDraftStateNotification';

const mockActionButtons = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('./ProjectProgrammeActionButtons', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockActionButtons(props);
    return <div data-testid="project-programme-action-buttons" />;
  },
}));

describe('ProjectProgrammeDraftStateNotification', () => {
  const onOpenSection = jest.fn();

  beforeEach(() => {
    onOpenSection.mockReset();
    mockActionButtons.mockReset();
  });

  it('renders draft state links and opens selected section', async () => {
    render(
      <ProjectProgrammeDraftStateNotification
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

  it('passes expected button overrides to action buttons', () => {
    render(
      <ProjectProgrammeDraftStateNotification
        sectionsInDraftState={[{ id: 'basicInfo', label: 'Basic info' }]}
        onOpenSection={onOpenSection}
        isProjectProgrammeComplete={true}
        effectiveProjectProgrammeId="programme-123"
      />,
    );

    const actionButtonProps = mockActionButtons.mock.calls[0][0];

    expect(actionButtonProps).toEqual(
      expect.objectContaining({
        isProjectProgrammeComplete: true,
        effectiveProjectProgrammeId: 'programme-123',
        buttonOverrides: {
          markReady: {
            variant: ButtonVariant.Secondary,
            theme: ButtonPresetTheme.Black,
            style: { backgroundColor: 'var(--color-white)' },
          },
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

  it('does not render when there are no draft sections', () => {
    render(
      <ProjectProgrammeDraftStateNotification
        sectionsInDraftState={[]}
        onOpenSection={onOpenSection}
        isProjectProgrammeComplete={false}
        effectiveProjectProgrammeId="programme-1"
      />,
    );

    expect(screen.queryByText('projectProgrammeForm.draftStateLabel')).toBeInTheDocument();
    expect(screen.queryByText('projectProgrammeForm.draftStateSections')).not.toBeInTheDocument();
  });
});
