import { act, screen } from '@testing-library/react';
import { Route } from 'react-router';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectProgrammeSectionCard from './ProjectProgrammeSectionCard';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';

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
  });

  it('opens section when action button is clicked', async () => {
    await renderSectionCard({ sectionIsStarted: false });

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }).click();
    });

    expect(baseProps.handleOpenSection).toHaveBeenCalledWith('basicInfo');
  });
});
