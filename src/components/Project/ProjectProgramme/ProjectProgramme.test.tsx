import mockI18next from '@/mocks/mockI18next';
import { TFunction } from 'i18next';
import { Route } from 'react-router';
import { act, screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import ProjectProgramme from './ProjectProgramme';
import { ProjectProgrammeStatus } from '@/interfaces/projectProgrammeInterfaces';
import { getProjectProgrammeSections } from './sections/projectProgrammeSections';
import { getFieldsForSection } from './sections/projectProgrammeSectionFields';

const mockSwitchType = jest.fn();
const mockTransitionProjectProgrammeStatus = jest.fn();
const mockTransitionProjectProgrammeSectionStatus = jest.fn();
const mockPostProjectProgramme = jest.fn();
const mockPostProjectProgrammeSection = jest.fn();
const mockPatchProjectProgrammeSection = jest.fn();
const mockSaveProjectProgrammeLocationMap = jest.fn();
const mockDeleteProjectProgrammeLocationMap = jest.fn();
const mockGetProjectProgrammeLocationMapBlob = jest.fn();
const mockIsConfirmed = jest.fn();
const mockGetProject = jest.fn();
const mockGetProjectProgrammeByProject = jest.fn();
const mockRefetchProjectProgramme = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/common', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('@/hooks/useConfirmDialog', () => ({
  __esModule: true,
  default: () => ({ isConfirmed: (...args: unknown[]) => mockIsConfirmed(...args) }),
}));

jest.mock('@/hooks/useGetProject', () => ({
  __esModule: true,
  default: () => mockGetProject(),
}));

jest.mock('@/api/projectProgrammeApi', () => ({
  useGetProjectProgrammeByProjectQuery: () => mockGetProjectProgrammeByProject(),
  usePostProjectProgrammeMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPostProjectProgramme(...args) }),
  ],
  usePostSwitchProjectProgrammeTypeMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockSwitchType(...args) }),
  ],
  useTransitionProjectProgrammeStatusMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockTransitionProjectProgrammeStatus(...args) }),
  ],
  useTransitionProjectProgrammeSectionStatusMutation: () => [
    (...args: unknown[]) => ({
      unwrap: () => mockTransitionProjectProgrammeSectionStatus(...args),
    }),
  ],
  usePostProjectProgrammeSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPostProjectProgrammeSection(...args) }),
  ],
  usePatchProjectProgrammeSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPatchProjectProgrammeSection(...args) }),
  ],
  useSaveProjectProgrammeLocationMapMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockSaveProjectProgrammeLocationMap(...args) }),
    { isLoading: false },
  ],
  useDeleteProjectProgrammeLocationMapMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockDeleteProjectProgrammeLocationMap(...args) }),
    { isLoading: false },
  ],
  getProjectProgrammeLocationMapBlob: (...args: unknown[]) =>
    mockGetProjectProgrammeLocationMapBlob(...args),
  usePostProjectProgrammeAttachmentsMutation: () => [() => ({ unwrap: jest.fn() })],
  useDeleteProjectProgrammeAttachmentMutation: () => [() => ({ unwrap: jest.fn() })],
}));

describe('ProjectProgramme', () => {
  const store = setupStore();

  function mockProjectProgramme(
    briefProjectProgramme: boolean,
    basicInfo: Record<string, unknown> | null = {
      projectName: 'Mock project',
      district: 'Keskinen',
    },
    designCriteria: Record<string, unknown> | null = null,
    status: ProjectProgrammeStatus = 'DRAFT',
  ) {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        id: 'programme-1',
        briefProjectProgramme,
        basicInfo,
        designCriteria,
        status,
      },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });
  }

  beforeEach(() => {
    const { useAppSelector } = jest.requireMock('@/hooks/common');

    useAppSelector.mockImplementation(
      (selector: (state: ReturnType<typeof store.getState>) => unknown) =>
        selector(store.getState()),
    );

    mockGetProject.mockReturnValue({
      data: {
        id: 'project-1',
        additionalInformation: 'Additional information',
        name: 'Mock project',
        projectDistrict: '',
      },
    });

    mockProjectProgramme(true);

    mockSwitchType.mockReset();
    mockTransitionProjectProgrammeStatus.mockReset();
    mockTransitionProjectProgrammeSectionStatus.mockReset();
    mockPostProjectProgramme.mockReset();
    mockPostProjectProgrammeSection.mockReset();
    mockPatchProjectProgrammeSection.mockReset();
    mockRefetchProjectProgramme.mockReset();
    mockSwitchType.mockResolvedValue({ id: 'programme-1', briefProjectProgramme: false });
    mockTransitionProjectProgrammeStatus.mockResolvedValue({ currentStatus: 'COMPLETE' });
    mockTransitionProjectProgrammeSectionStatus.mockResolvedValue({});
    mockPostProjectProgrammeSection.mockResolvedValue({
      projectName: 'Mock project',
      district: 'Keskinen',
    });
    mockPatchProjectProgrammeSection.mockResolvedValue({});
    mockPostProjectProgramme.mockResolvedValue({
      id: 'created-programme-id',
      briefProjectProgramme: true,
    });
  });

  const render = async () =>
    await act(async () =>
      renderWithProviders(
        <Route path="/project/:projectId/project-programme" element={<ProjectProgramme />} />,
        {},
        { route: '/project/project-1/project-programme' },
      ),
    );

  it('renders action buttons enabled when project programme id exists', async () => {
    await render();

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.switchToExtendedProgramme' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.modifyInformation' }),
    ).toBeEnabled();
    screen.getAllByRole('button', { name: 'projectProgrammeForm.markReady' }).forEach((button) => {
      expect(button).toBeEnabled();
    });
  });

  it.each([0, 1])(
    'blocks completion from button %s and lists missing sections with links',
    async (buttonIndex) => {
      mockProjectProgramme(false);
      await render();
      await act(async () => {
        screen
          .getAllByRole('button', { name: 'projectProgrammeForm.markReady' })
          [buttonIndex].click();
      });
      expect(mockTransitionProjectProgrammeStatus).not.toHaveBeenCalled();
      expect(
        screen.getByText('projectProgrammeForm.missingRequiredFieldsText'),
      ).toBeInTheDocument();
      const missingFields = screen.getByText(
        'projectProgrammeForm.missingRequiredFieldsText',
      ).parentElement!;
      expect(within(missingFields).getAllByRole('link')).toHaveLength(8);
      expect(
        within(missingFields).getByRole('link', {
          name: 'projectProgrammeForm.locationSectionTitle',
        }),
      ).toBeInTheDocument();
      await act(async () => {
        within(missingFields)
          .getByRole('link', { name: 'projectProgrammeForm.designCriteriaCardTitle' })
          .click();
      });
      expect(screen.getByTestId('project-programme-design-criteria-form')).toBeInTheDocument();
    },
  );

  it.each([0, 1])('focuses missing fields only on submit from button %s', async (buttonIndex) => {
    await render();
    const getNotification = () =>
      screen.getByText('projectProgrammeForm.missingRequiredFieldsText').closest('[tabindex="-1"]');

    for (let attempt = 0; attempt < 2; attempt++) {
      const submitButton = screen.getAllByRole('button', {
        name: 'projectProgrammeForm.markReady',
      })[buttonIndex];
      submitButton.focus();
      await act(async () => {
        submitButton.click();
      });
      await waitFor(() => expect(getNotification()).toHaveFocus());
    }

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.modifyInformation' }).click();
    });
    mockProjectProgramme(true, { projectName: 'Updated project', district: 'Keskinen' });
    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.cancel' }).click();
    });
    expect(getNotification()).not.toHaveFocus();
  });

  it('lists basic information and the location map when brief programme completion is blocked', async () => {
    await render();
    await act(async () => {
      screen.getAllByRole('button', { name: 'projectProgrammeForm.markReady' })[0].click();
    });
    const missingFields = screen.getByText(
      'projectProgrammeForm.missingRequiredFieldsText',
    ).parentElement!;
    expect(within(missingFields).getAllByRole('link')).toHaveLength(2);
    expect(
      within(missingFields).getByRole('link', { name: 'projectProgrammeForm.basicInfoCardTitle' }),
    ).toBeInTheDocument();
    expect(
      within(missingFields).getByRole('link', {
        name: 'projectProgrammeForm.locationSectionTitle',
      }),
    ).toBeInTheDocument();
    expect(mockTransitionProjectProgrammeStatus).not.toHaveBeenCalled();
  });

  it('updates the missing section list when saved programme data changes', async () => {
    mockProjectProgramme(false);
    await render();
    await act(async () => {
      screen.getAllByRole('button', { name: 'projectProgrammeForm.markReady' })[0].click();
    });
    mockProjectProgramme(false, undefined, {
      relationshipToPublicAreaServices: 'Services',
      siteValuesProtectionAndSignificance: 'Values',
    });
    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.fillDesignCriteria' }).click();
    });
    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.cancel' }).click();
    });
    const missingFields = screen.getByText(
      'projectProgrammeForm.missingRequiredFieldsText',
    ).parentElement!;
    expect(within(missingFields).getAllByRole('link')).toHaveLength(7);
    expect(
      within(missingFields).queryByRole('link', {
        name: 'projectProgrammeForm.designCriteriaCardTitle',
      }),
    ).not.toBeInTheDocument();
  });

  it.each([0, 1])(
    'allows completion from button %s when filled sections are still drafts',
    async (buttonIndex) => {
      const programme = {
        id: 'programme-1',
        briefProjectProgramme: false,
        status: 'DRAFT' as const,
      };
      const sections = getProjectProgrammeSections(((key: string) => key) as TFunction, false);
      mockGetProjectProgrammeByProject.mockReturnValue({
        data: {
          ...programme,
          locationMap: { id: 'map-1', url: '/map.png', originalName: 'map.png' },
          ...Object.fromEntries(
            sections.map((section) => [
              section.id,
              {
                status: 'DRAFT',
                ...Object.fromEntries(
                  getFieldsForSection(section.id, programme).map((field) => [field, 'Filled']),
                ),
              },
            ]),
          ),
        },
        isLoading: false,
        refetch: mockRefetchProjectProgramme,
      });
      await render();
      await act(async () => {
        screen
          .getAllByRole('button', { name: 'projectProgrammeForm.markReady' })
          [buttonIndex].click();
      });
      expect(mockTransitionProjectProgrammeStatus).toHaveBeenCalledWith({
        id: 'programme-1',
        to: 'COMPLETE',
      });
      expect(mockTransitionProjectProgrammeSectionStatus).not.toHaveBeenCalled();
      expect(
        screen.queryByText('projectProgrammeForm.missingRequiredFieldsText'),
      ).not.toBeInTheDocument();
    },
  );

  it('includes draft and completed sections in draft state notification', async () => {
    mockProjectProgramme(
      false,
      {
        projectName: 'Mock project',
        district: 'Keskinen',
        status: 'DRAFT',
      },
      {
        guidingZoningRegulations: 'Regulation text',
        status: 'COMPLETE',
      },
    );

    await render();

    expect(
      screen.getByRole('link', { name: 'projectProgrammeForm.basicInfoCardTitle' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'projectProgrammeForm.designCriteriaCardTitle' }),
    ).toBeInTheDocument();
  });

  it('opens existing basic info form without posting section when section already exists', async () => {
    mockProjectProgramme(false);
    await render();

    const fillBasicInfoButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.modifyInformation',
    });

    await act(async () => {
      fillBasicInfoButton.click();
    });

    expect(mockPostProjectProgrammeSection).not.toHaveBeenCalled();
    expect(screen.getByTestId('project-programme-basic-info-form')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mock project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Keskinen')).toBeInTheDocument();
  });

  it('uses the secondary modify action and keeps switching to brief available when only basic info is saved', async () => {
    mockProjectProgramme(false);
    await render();

    const modifyInformationButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.modifyInformation',
    });

    expect(modifyInformationButton).toHaveClass('Button-module_secondary__1nABp');
    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.switchToBriefProgramme' }),
    ).toBeInTheDocument();
  });

  it('shows switching to brief when no extended section has been saved yet', async () => {
    mockProjectProgramme(false, null);
    await render();

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.switchToBriefProgramme' }),
    ).toBeInTheDocument();
  });

  it('shows the fill action when basic info has no user-entered content', async () => {
    mockProjectProgramme(false, {
      id: 'basic-info-1',
      projectProgramme: 'programme-1',
      projectName: ' ',
      district: null,
      links: [{ value: '' }],
    });
    await render();

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }),
    ).toBeInTheDocument();
  });

  it('hides switching to brief once extended-only basic info content is saved', async () => {
    mockProjectProgramme(false, {
      projectName: 'Mock project',
      district: 'Keskinen',
      strategyGoals: 'Some strategy goals',
    });
    await render();

    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.switchToBriefProgramme' }),
    ).not.toBeInTheDocument();
  });

  it('keeps switching to brief available when extended-only data is whitespace', async () => {
    mockProjectProgramme(false, {
      projectName: 'Mock project',
      district: 'Keskinen',
      strategyGoals: '   ',
    });
    await render();

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.switchToBriefProgramme' }),
    ).toBeInTheDocument();
  });

  it('does not create basic info when it is opened and cancelled without changes', async () => {
    mockProjectProgramme(false, null);
    await render();

    const fillBasicInfoButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.fillBasicInfo',
    });

    await act(async () => {
      fillBasicInfoButton.click();
    });

    expect(mockPostProjectProgrammeSection).not.toHaveBeenCalled();
    expect(screen.getByTestId('project-programme-basic-info-form')).toBeInTheDocument();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.cancel' }).click();
    });

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }),
    ).toBeInTheDocument();
  });

  it('returns from basic info form back to overview when close button is clicked', async () => {
    mockProjectProgramme(false);
    await render();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.modifyInformation' }).click();
    });

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.cancel' }).click();
    });

    expect(screen.queryByTestId('project-programme-basic-info-form')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.modifyInformation' }),
    ).toBeInTheDocument();
  });

  it('hides the design criteria section in brief programme mode', async () => {
    mockProjectProgramme(true);
    await render();

    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.fillDesignCriteria' }),
    ).not.toBeInTheDocument();
  });

  it('shows the new planning criteria sections only in the complete programme and opens each form', async () => {
    mockProjectProgramme(false);
    await render();

    const fillTrafficPlanningCriteria = screen.getByRole('button', {
      name: 'projectProgrammeForm.fillTrafficPlanningCriteria',
    });
    await act(async () => {
      fillTrafficPlanningCriteria.click();
    });

    expect(
      screen.getByTestId('project-programme-traffic-planning-criteria-form'),
    ).toBeInTheDocument();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.cancel' }).click();
    });

    await act(async () => {
      screen
        .getByRole('button', {
          name: 'projectProgrammeForm.fillUrbanSpacingPlanningCriteria',
        })
        .click();
    });

    expect(
      screen.getByTestId('project-programme-urban-spacing-planning-criteria-form'),
    ).toBeInTheDocument();
  });

  it('does not create design criteria when it is opened and cancelled without changes', async () => {
    mockProjectProgramme(false);
    await render();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.fillDesignCriteria' }).click();
    });

    expect(mockPostProjectProgrammeSection).not.toHaveBeenCalled();
    expect(screen.getByTestId('project-programme-design-criteria-form')).toBeInTheDocument();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.cancel' }).click();
    });

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.fillDesignCriteria' }),
    ).toBeInTheDocument();
  });

  it('shows the fill action when design criteria has no user-entered content', async () => {
    mockProjectProgramme(false, null, {
      id: 'design-criteria-1',
      projectProgramme: 'programme-1',
      guidingZoningRegulations: '',
      siteValuesProtectionAndSignificance: null,
      relationshipToPublicAreaServices: '   ',
      links: [{ value: '' }],
    });
    await render();

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.fillDesignCriteria' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.modifyInformation' }),
    ).not.toBeInTheDocument();
  });

  it('opens saved design criteria without posting and shows the stored values', async () => {
    mockProjectProgramme(false, null, {
      guidingZoningRegulations: 'Saved zoning',
      siteValuesProtectionAndSignificance: 'Saved site values',
      relationshipToPublicAreaServices: 'Saved public area services',
      links: [{ value: 'https://saved-design-link.fi' }],
    });
    await render();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.modifyInformation' }).click();
    });

    expect(mockPostProjectProgrammeSection).not.toHaveBeenCalled();
    expect(screen.getByTestId('project-programme-design-criteria-form')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Saved zoning')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Saved site values')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Saved public area services')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://saved-design-link.fi')).toBeInTheDocument();
  });

  it('shows start project programme card when project programme does not exist yet', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });

    mockGetProject.mockReturnValue({
      data: {
        id: 'project-1',
        name: 'Prefilled project',
        projectDistrict: '',
      },
    });

    await render();

    expect(screen.getByTestId('start-project-programme')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.startProjectProgramme' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }),
    ).not.toBeInTheDocument();
  });

  it('shows load error state when fetching project programme fails with non-404 error', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: undefined,
      error: { status: 500 },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });

    await render();

    expect(screen.getByTestId('project-programme-load-error')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.startProjectProgramme' }),
    ).not.toBeInTheDocument();
  });

  it('shows start project programme card when query returns data without id', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        briefProjectProgramme: true,
      },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });

    await render();

    expect(screen.getByTestId('start-project-programme')).toBeInTheDocument();
  });

  it('creates project programme from start view when project programme does not exist yet', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });

    mockGetProject.mockReturnValue({
      data: {
        id: 'project-1',
        name: 'Prefilled project',
        projectDistrict: '',
      },
    });

    await render();

    const startButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.startProjectProgramme',
    });

    await act(async () => {
      startButton.click();
    });

    expect(mockPostProjectProgramme).toHaveBeenCalledWith({ project: 'project-1' });
  });

  it('shows overview bottom-bar actions', async () => {
    await render();

    const projectFormBanner = Array.from(
      document.querySelectorAll<HTMLElement>('.project-form-banner'),
    ).find((banner) => within(banner).queryByRole('button', { name: 'copyLink' }));

    expect(projectFormBanner).toBeInTheDocument();

    if (!projectFormBanner) {
      throw new Error('Expected overview actions to be inside project-form-banner');
    }

    expect(
      within(projectFormBanner).getByRole('button', {
        name: 'projectProgrammeForm.markReady',
      }),
    ).toBeInTheDocument();
    expect(within(projectFormBanner).getByRole('button', { name: 'copyLink' })).toBeInTheDocument();
    expect(
      within(projectFormBanner).getByRole('button', {
        name: 'projectProgrammeForm.makePdf',
      }),
    ).toBeInTheDocument();
  });

  it('does not refetch project programme when creation returns conflict', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });

    mockPostProjectProgramme.mockRejectedValue({ status: 409 });

    await render();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.startProjectProgramme' }).click();
    });

    expect(mockRefetchProjectProgramme).not.toHaveBeenCalled();
  });

  it('does not refetch project programme when creation is forbidden', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });

    mockPostProjectProgramme.mockRejectedValue({ status: 403 });

    await render();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.startProjectProgramme' }).click();
    });

    expect(mockRefetchProjectProgramme).not.toHaveBeenCalled();
  });

  const savedLocationMap = {
    id: 'map-1',
    url: '/project-programmes/programme-1/location-map/',
    originalName: 'map.png',
  };

  function mockProgrammeWithLocationMap(status: ProjectProgrammeStatus = 'DRAFT') {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        id: 'programme-1',
        briefProjectProgramme: true,
        status,
        locationMap: savedLocationMap,
      },
      isLoading: false,
      refetch: mockRefetchProjectProgramme,
    });
  }

  it('uploads the location map as form data when a file is attached', async () => {
    mockSaveProjectProgrammeLocationMap.mockResolvedValue({});
    const { user } = await render();

    const file = new File(['map'], 'map.png', { type: 'image/png' });
    const input = screen.getByLabelText(/projectProgrammeForm.locationSectionTitle/, {
      selector: 'input',
    });

    await user.upload(input, file);

    expect(mockSaveProjectProgrammeLocationMap).toHaveBeenCalledWith({
      id: 'programme-1',
      formData: expect.any(FormData),
    });
    const { formData } = mockSaveProjectProgrammeLocationMap.mock.calls[0][0] as {
      formData: FormData;
    };
    expect((formData.get('file') as File).name).toBe('map.png');
  });

  it('shows the saved location map fetched with authentication', async () => {
    const originalCreateObjectUrl = URL.createObjectURL;
    const originalRevokeObjectUrl = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:location-map');
    URL.revokeObjectURL = jest.fn();
    mockGetProjectProgrammeLocationMapBlob.mockResolvedValue(new Blob(['map']));
    mockProgrammeWithLocationMap();

    try {
      await render();

      expect(await screen.findByTestId('project-programme-location-map-image')).toHaveAttribute(
        'src',
        'blob:location-map',
      );
      expect(mockGetProjectProgrammeLocationMapBlob).toHaveBeenCalledWith(savedLocationMap.url);
      // A saved map is replaced by deleting it first, as in the design
      expect(screen.queryByTestId('project-programme-location-map-input')).not.toBeInTheDocument();
    } finally {
      URL.createObjectURL = originalCreateObjectUrl;
      URL.revokeObjectURL = originalRevokeObjectUrl;
    }
  });

  it('deletes the location map after confirmation', async () => {
    mockGetProjectProgrammeLocationMapBlob.mockResolvedValue(new Blob(['map']));
    mockIsConfirmed.mockResolvedValue(true);
    mockDeleteProjectProgrammeLocationMap.mockResolvedValue(undefined);
    mockProgrammeWithLocationMap();
    const { user } = await render();

    await user.click(screen.getByTestId('project-programme-location-map-delete'));

    expect(mockIsConfirmed).toHaveBeenCalled();
    expect(mockDeleteProjectProgrammeLocationMap).toHaveBeenCalledWith({ id: 'programme-1' });
  });

  it('does not delete the location map when the dialog is cancelled', async () => {
    mockGetProjectProgrammeLocationMapBlob.mockResolvedValue(new Blob(['map']));
    mockIsConfirmed.mockResolvedValue(false);
    mockProgrammeWithLocationMap();
    const { user } = await render();

    await user.click(screen.getByTestId('project-programme-location-map-delete'));

    expect(mockDeleteProjectProgrammeLocationMap).not.toHaveBeenCalled();
  });

  it('does not allow changing the location map of a completed programme', async () => {
    mockGetProjectProgrammeLocationMapBlob.mockResolvedValue(new Blob(['map']));
    mockProgrammeWithLocationMap('COMPLETE');

    await render();

    expect(screen.queryByTestId('project-programme-location-map-delete')).not.toBeInTheDocument();
    expect(screen.queryByTestId('project-programme-location-map-input')).not.toBeInTheDocument();
  });
});
