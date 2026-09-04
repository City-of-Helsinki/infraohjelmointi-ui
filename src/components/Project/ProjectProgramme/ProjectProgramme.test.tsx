import mockI18next from '@/mocks/mockI18next';
import { Route } from 'react-router';
import { act, screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import ProjectProgramme from './ProjectProgramme';

const mockSwitchType = jest.fn();
const mockTransitionProjectProgrammeStatus = jest.fn();
const mockPostProjectProgramme = jest.fn();
const mockPostProjectProgrammeSection = jest.fn();
const mockPatchProjectProgrammeSection = jest.fn();
const mockGetProject = jest.fn();
const mockGetProjectProgrammeByProject = jest.fn();
const mockRefetchProjectProgramme = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/common', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
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
  usePostProjectProgrammeSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPostProjectProgrammeSection(...args) }),
  ],
  usePatchProjectProgrammeSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPatchProjectProgrammeSection(...args) }),
  ],
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
  ) {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        id: 'programme-1',
        briefProjectProgramme,
        basicInfo,
        designCriteria,
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
        projectProgram: 'programme-1',
        name: 'Mock project',
        projectDistrict: '',
      },
    });

    mockProjectProgramme(true);

    mockSwitchType.mockReset();
    mockTransitionProjectProgrammeStatus.mockReset();
    mockPostProjectProgramme.mockReset();
    mockPostProjectProgrammeSection.mockReset();
    mockPatchProjectProgrammeSection.mockReset();
    mockRefetchProjectProgramme.mockReset();
    mockSwitchType.mockResolvedValue({ id: 'programme-1', briefProjectProgramme: false });
    mockTransitionProjectProgrammeStatus.mockResolvedValue({ currentStatus: 'COMPLETE' });
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
    expect(screen.getByRole('button', { name: 'projectProgrammeForm.markReady' })).toBeEnabled();
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

    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.markReady' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'copyLink' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' }),
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
});
