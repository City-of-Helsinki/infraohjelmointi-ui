import mockI18next from '@/mocks/mockI18next';
import { Route } from 'react-router';
import { act, screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectProgramme from './ProjectProgramme';
import { setupStore } from '@/store';

const mockSwitchType = jest.fn();
const mockPostBasicInfo = jest.fn();
const mockPostProjectProgramme = jest.fn();
const mockGetProject = jest.fn();
const mockGetProjectProgrammeByProject = jest.fn();
const mockGetProjectProgrammeById = jest.fn();

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
  useGetProjectProgrammeByIdQuery: () => mockGetProjectProgrammeById(),
  usePostProjectProgrammeMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPostProjectProgramme(...args) }),
  ],
  usePostSwitchProjectProgrammeTypeMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockSwitchType(...args) }),
  ],
  usePostProjectProgrammeBasicInfoSectionMutation: () => [
    (...args: unknown[]) => ({ unwrap: () => mockPostBasicInfo(...args) }),
  ],
}));

describe('ProjectProgramme', () => {
  const store = setupStore();

  beforeEach(() => {
    const { useAppSelector } = jest.requireMock('@/hooks/common');

    useAppSelector.mockImplementation((selector: (state: ReturnType<typeof store.getState>) => unknown) =>
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

    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        id: 'programme-1',
        briefProjectProgramme: true,
        basicInfo: { projectName: 'Mock project', district: 'Keskinen' },
      },
    });
    mockGetProjectProgrammeById.mockReturnValue({
      data: { id: 'programme-1', briefProjectProgramme: true },
    });

    mockSwitchType.mockReset();
    mockPostBasicInfo.mockReset();
    mockPostProjectProgramme.mockReset();
    mockSwitchType.mockResolvedValue({ id: 'programme-1', briefProjectProgramme: false });
    mockPostBasicInfo.mockResolvedValue({ name: 'Mock project', district: 'Keskinen' });
    mockPostProjectProgramme.mockResolvedValue({ id: 'created-programme-id' });
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
  });

  it('moves from overview to basic info form when fill basic info is clicked', async () => {
    await render();

    const fillBasicInfoButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.fillBasicInfo',
    });

    await act(async () => {
      fillBasicInfoButton.click();
    });

    expect(mockPostBasicInfo).not.toHaveBeenCalled();
    expect(screen.getByTestId('project-programme-basic-info-form')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mock project')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Keskinen'),
    ).toBeInTheDocument();
  });

  it('shows basic info form with local prefills when project programme does not exist yet', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: undefined,
      error: { status: 500 },
    });

    mockGetProject.mockReturnValue({
      data: {
        id: 'project-1',
        name: 'Prefilled project',
        projectDistrict: '',
      },
    });

    await render();

    const fillBasicInfoButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.fillBasicInfo',
    });

    await act(async () => {
      fillBasicInfoButton.click();
    });

    expect(mockPostBasicInfo).not.toHaveBeenCalled();
    expect(screen.getByTestId('project-programme-basic-info-form')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Prefilled project')).toBeInTheDocument();
  });

  it('creates project programme lazily on switch type when project programme does not exist yet', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: undefined,
      error: { status: 500 },
    });

    mockGetProject.mockReturnValue({
      data: {
        id: 'project-1',
        name: 'Prefilled project',
        projectDistrict: '',
      },
    });

    await render();

    const switchButton = screen.getByRole('button', {
      name: 'projectProgrammeForm.switchToExtendedProgramme',
    });

    await act(async () => {
      switchButton.click();
    });

    expect(mockPostProjectProgramme).toHaveBeenCalledWith({ project: 'project-1' });
    expect(mockSwitchType).toHaveBeenCalledWith('created-programme-id');
  });
});
