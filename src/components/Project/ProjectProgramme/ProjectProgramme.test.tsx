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
    basicInfo: { projectName: string; district: string } | null = {
      projectName: 'Mock project',
      district: 'Keskinen',
    },
  ) {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        id: 'programme-1',
        briefProjectProgramme,
        basicInfo,
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
      screen.getByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }),
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'projectProgrammeForm.markReady' })).toBeEnabled();
  });

  it('opens existing basic info form without posting section when section already exists', async () => {
    mockProjectProgramme(false);
    await render();

    const fillBasicInfoButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.fillBasicInfo',
    });

    await act(async () => {
      fillBasicInfoButton.click();
    });

    expect(mockPostProjectProgrammeSection).not.toHaveBeenCalled();
    expect(screen.getByTestId('project-programme-basic-info-form')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mock project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Keskinen')).toBeInTheDocument();
  });

  it('creates basic info section when it does not exist yet', async () => {
    mockProjectProgramme(false, null);
    await render();

    const fillBasicInfoButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.fillBasicInfo',
    });

    await act(async () => {
      fillBasicInfoButton.click();
    });

    expect(mockPostProjectProgrammeSection).toHaveBeenCalledWith({
      id: 'programme-1',
      section: 'basic-info',
    });
    expect(screen.getByTestId('project-programme-basic-info-form')).toBeInTheDocument();
  });

  it('returns from basic info form back to overview when close button is clicked', async () => {
    mockProjectProgramme(false);
    await render();

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }).click();
    });

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.cancel' }).click();
    });

    expect(screen.queryByTestId('project-programme-basic-info-form')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'projectProgrammeForm.fillBasicInfo' }),
    ).toBeInTheDocument();
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

  it('refetches project programme when creation returns conflict', async () => {
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

    expect(mockRefetchProjectProgramme).toHaveBeenCalled();
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
