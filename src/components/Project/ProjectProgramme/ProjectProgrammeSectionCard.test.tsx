import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectProgrammeSectionCard from './ProjectProgrammeSectionCard';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';

const mockDispatch = jest.fn();
const mockTransitionSectionStatus = jest.fn();

jest.mock('@/hooks/common', () => ({
  ...jest.requireActual('@/hooks/common'),
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/api/projectProgrammeApi', () => ({
  useTransitionProjectProgrammeSectionStatusMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockTransitionSectionStatus(...args) }),
  ],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));

describe('ProjectProgrammeSectionCard readonly sections', () => {
  const baseProps = {
    handleOpenSection: jest.fn(),
    label: 'Basic info',
    cardText: 'Please fill this section',
    actionText: 'projectProgrammeForm.fillBasicInfo',
    sectionId: 'basicInfo' as const,
    programmeIsComplete: false,
  };

  const renderSectionCard = async (
    props: Partial<React.ComponentProps<typeof ProjectProgrammeSectionCard>> = {},
  ) => {
    await act(async () => {
      renderWithProviders(
        <Route
          path="/"
          element={
            <ProjectProgrammeSectionCard
              sectionIsStarted={false}
              projectProgramme={undefined}
              {...baseProps}
              {...props}
            />
          }
        />,
      );
    });
  };

  beforeEach(() => {
    baseProps.handleOpenSection.mockReset();
    mockDispatch.mockReset();
    mockTransitionSectionStatus.mockReset();
    mockTransitionSectionStatus.mockResolvedValue({});
  });

  it('shows readonly accordion and saved values when section data exists', async () => {
    const projectProgramme: IProjectProgramme = {
      id: 'programme-1',
      briefProjectProgramme: true,
      basicInfo: {
        summary: 'Saved summary',
        links: [{ value: 'https://example.com' }],
      },
    };

    await renderSectionCard({ sectionIsStarted: true, projectProgramme });

    await act(async () => {
      screen.getByRole('button', { name: 'content' }).click();
    });

    expect(screen.getByText('Saved summary')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /https:\/\/example\.com/ })).toBeInTheDocument();
  });

  it('hides readonly accordion when section data is missing', async () => {
    const projectProgramme: IProjectProgramme = {
      id: 'programme-1',
      briefProjectProgramme: true,
    };

    await renderSectionCard({ sectionIsStarted: false, projectProgramme });

    expect(screen.queryByRole('button', { name: 'content' })).not.toBeInTheDocument();
    expect(screen.queryByText('projectProgrammeForm.draftStatus')).not.toBeInTheDocument();
  });

  it('shows draft status only for a started draft section', async () => {
    await renderSectionCard({
      sectionIsStarted: true,
      projectProgramme: { id: 'programme-1', basicInfo: { status: 'DRAFT', summary: 'Draft' } },
    });

    expect(screen.getByText('projectProgrammeForm.draftStatus')).toBeInTheDocument();
    expect(
      screen.queryByText('projectProgrammeForm.sectionCompleteStatus'),
    ).not.toBeInTheDocument();
  });

  it('keeps a long title beside the status pill in the notification heading', async () => {
    const label = 'Vuorovaikutus, yhteistyötahot ja liittyvät hankkeet';
    await renderSectionCard({
      label,
      sectionIsStarted: true,
      projectProgramme: { id: 'programme-1', basicInfo: { status: 'DRAFT', summary: 'Draft' } },
    });

    const title = screen.getByText(label);
    const heading = title.closest('[role="heading"]');
    expect(title).toHaveClass('min-w-0', 'flex-1', 'break-words');
    expect(title.parentElement).toHaveClass('flex', 'items-start', 'gap-2');
    expect(
      document.querySelector('.project-programme-section > section > div > [role="heading"]'),
    ).toBe(heading);
    expect(heading).toContainElement(screen.getByText('projectProgrammeForm.draftStatus'));
  });

  it('shows complete status only for a started complete section', async () => {
    await renderSectionCard({
      sectionIsStarted: true,
      projectProgramme: { id: 'programme-1', basicInfo: { status: 'COMPLETE' } },
    });

    expect(screen.getByText('projectProgrammeForm.sectionCompleteStatus')).toBeInTheDocument();
    expect(screen.queryByText('projectProgrammeForm.draftStatus')).not.toBeInTheDocument();
  });

  it('does not show a status for a section that has not started', async () => {
    await renderSectionCard({
      projectProgramme: { id: 'programme-1', basicInfo: { status: 'DRAFT' } },
    });

    expect(screen.queryByText('projectProgrammeForm.draftStatus')).not.toBeInTheDocument();
  });

  it('opens section when action button is clicked', async () => {
    await renderSectionCard({
      sectionIsStarted: false,
      projectProgramme: { id: 'programme-1', status: 'DRAFT' },
    });

    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.markSectionReady' }),
    ).toBeNull();
    expect(mockTransitionSectionStatus).not.toHaveBeenCalled();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }).click();
    });

    expect(baseProps.handleOpenSection).toHaveBeenCalledWith('basicInfo');
  });

  it('marks a draft section ready from the card', async () => {
    await renderSectionCard({
      sectionIsStarted: true,
      projectProgramme: { id: 'programme-1', status: 'DRAFT', basicInfo: { status: 'DRAFT' } },
    });

    fireEvent.click(screen.getByRole('button', { name: 'projectProgrammeForm.markSectionReady' }));

    await waitFor(() => {
      expect(mockTransitionSectionStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'basic-info',
        to: 'COMPLETE',
      });
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ message: 'projectProgrammeSectionMarkReadySuccess' }),
      }),
    );
    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.markSectionReady' }).parentElement,
    ).toHaveClass('gap-4');
  });

  it('returns a complete section to draft only when the programme is a draft', async () => {
    const projectProgramme: IProjectProgramme = {
      id: 'programme-1',
      status: 'DRAFT',
      basicInfo: { status: 'COMPLETE' },
    };

    await renderSectionCard({ sectionIsStarted: true, projectProgramme });

    fireEvent.click(
      screen.getByRole('button', { name: 'projectProgrammeForm.returnSectionToDraft' }),
    );

    await waitFor(() => {
      expect(mockTransitionSectionStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        section: 'basic-info',
        to: 'DRAFT',
      });
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: 'projectProgrammeSectionReturnToDraftSuccess',
        }),
      }),
    );
  });

  it('hides the section transition for a complete programme or a draft section', async () => {
    await renderSectionCard({
      projectProgramme: {
        id: 'programme-1',
        status: 'COMPLETE',
        basicInfo: { status: 'COMPLETE' },
      },
      programmeIsComplete: true,
    });

    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.returnSectionToDraft' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.markSectionReady' }),
    ).toBeNull();

    await renderSectionCard({
      projectProgramme: { id: 'programme-1', status: 'DRAFT', basicInfo: { status: 'DRAFT' } },
    });

    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.returnSectionToDraft' }),
    ).toBeNull();
    expect(mockTransitionSectionStatus).not.toHaveBeenCalled();
  });
});
