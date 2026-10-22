import mockI18next from '@/mocks/mockI18next';
import { act, render, screen } from '@testing-library/react';
import { saveAs } from 'file-saver';
import ProjectProgrammeActionButtons from '../ProjectProgrammeActionButtons';
import { createProjectProgrammePdfBlob } from './createProjectProgrammePdf';
import { getDownloadUrl, revokeObjectUrls } from '@/utils/fileUtils';

const mockDispatch = jest.fn();
const mockGetProjectProgrammeByProject = jest.fn();

jest.mock('react-i18next', () => mockI18next());
jest.mock('i18next', () => ({ t: (key: string) => key }));

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

jest.mock('@/utils/fileUtils', () => ({
  getDownloadUrl: jest.fn(),
  revokeObjectUrls: jest.fn(),
}));

jest.mock('./createProjectProgrammePdf', () => ({
  createProjectProgrammePdfBlob: jest.fn(),
}));

jest.mock('@/hooks/common', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/hooks/useGetProject', () => ({
  __esModule: true,
  default: () => ({ data: { id: 'project-1', name: 'Project name' } }),
}));

jest.mock('@/api/projectProgrammeApi', () => ({
  useGetProjectProgrammeByProjectQuery: () => mockGetProjectProgrammeByProject(),
}));

const createBlobMock = createProjectProgrammePdfBlob as jest.MockedFunction<
  typeof createProjectProgrammePdfBlob
>;

describe('ProjectProgrammeActionButtons pdf generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        id: 'programme-1',
        status: 'DRAFT',
        briefProjectProgramme: true,
        basicInfo: { projectName: 'Puisto' },
      },
    });
  });

  it('generates and saves the pdf with only brief sections for a brief programme', async () => {
    const blob = new Blob(['pdf']);
    createBlobMock.mockResolvedValue(blob);

    render(<ProjectProgrammeActionButtons />);

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' }).click();
    });

    expect(createBlobMock).toHaveBeenCalledTimes(1);
    const props = createBlobMock.mock.calls[0][0];
    expect(props.projectName).toBe('Puisto');
    expect(props.locationMapSrc).toBeUndefined();
    expect(getDownloadUrl).not.toHaveBeenCalled();
    expect(props.sections.map((section) => section.id)).toEqual(['basicInfo']);
    expect(saveAs).toHaveBeenCalledWith(
      blob,
      expect.stringMatching(/^projectProgrammeForm\.pdfTitle_Puisto_\d{4}-\d{2}-\d{2}\.pdf$/),
    );
  });

  it.each([true, false])('includes the location map for brief=%s', async (isBrief) => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: {
        id: 'programme-1',
        briefProjectProgramme: isBrief,
        locationMap: { url: '/location-map.png' },
      },
    });
    jest.mocked(getDownloadUrl).mockResolvedValue('blob:location-map');
    createBlobMock.mockResolvedValue(new Blob(['pdf']));

    render(<ProjectProgrammeActionButtons />);

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' }).click();
    });

    expect(getDownloadUrl).toHaveBeenCalledWith('/location-map.png');
    expect(createBlobMock.mock.calls[0][0].locationMapSrc).toBe('blob:location-map');
    expect(saveAs).toHaveBeenCalled();
    expect(revokeObjectUrls).toHaveBeenCalledWith(['blob:location-map']);
  });

  it('reports a failed map download instead of saving a pdf without the map', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: { id: 'programme-1', locationMap: { url: '/location-map.png' } },
    });
    jest.mocked(getDownloadUrl).mockResolvedValue(undefined);

    render(<ProjectProgrammeActionButtons />);

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' }).click();
    });

    expect(createBlobMock).not.toHaveBeenCalled();
    expect(saveAs).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ message: 'projectProgrammePdfGenerationError' }),
      }),
    );
    expect(screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' })).toBeEnabled();
  });

  it('releases the downloaded map when pdf generation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: { id: 'programme-1', locationMap: { url: '/location-map.png' } },
    });
    jest.mocked(getDownloadUrl).mockResolvedValue('blob:location-map');
    createBlobMock.mockRejectedValue(new Error('fail'));

    render(<ProjectProgrammeActionButtons />);

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' }).click();
    });

    expect(saveAs).not.toHaveBeenCalled();
    expect(revokeObjectUrls).toHaveBeenCalledWith(['blob:location-map']);
  });

  it('includes all sections for an extended programme', async () => {
    mockGetProjectProgrammeByProject.mockReturnValue({
      data: { id: 'programme-1', status: 'COMPLETE', briefProjectProgramme: false },
    });
    createBlobMock.mockResolvedValue(new Blob(['pdf']));

    render(<ProjectProgrammeActionButtons />);

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' }).click();
    });

    const props = createBlobMock.mock.calls[0][0];
    expect(props.sections).toHaveLength(7);
    expect(props.projectName).toBe('Project name');
  });

  it('shows an error notification when generation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    createBlobMock.mockRejectedValue(new Error('fail'));

    render(<ProjectProgrammeActionButtons />);

    await act(async () => {
      screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' }).click();
    });

    expect(saveAs).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ message: 'projectProgrammePdfGenerationError' }),
      }),
    );
  });

  it('disables the button when there is no project programme', () => {
    mockGetProjectProgrammeByProject.mockReturnValue({ data: undefined });

    render(<ProjectProgrammeActionButtons />);

    expect(screen.getByRole('button', { name: 'projectProgrammeForm.makePdf' })).toBeDisabled();
  });
});
