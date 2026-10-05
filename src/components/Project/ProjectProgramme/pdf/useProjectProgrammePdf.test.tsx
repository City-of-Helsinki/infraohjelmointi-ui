import mockI18next from '@/mocks/mockI18next';
import { act, render, screen } from '@testing-library/react';
import { saveAs } from 'file-saver';
import ProjectProgrammeActionButtons from '../ProjectProgrammeActionButtons';
import { createProjectProgrammePdfBlob } from './createProjectProgrammePdf';

const mockDispatch = jest.fn();
const mockGetProjectProgrammeByProject = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

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
    expect(props.sections.map((section) => section.id)).toEqual(['basicInfo']);
    expect(saveAs).toHaveBeenCalledWith(
      blob,
      expect.stringMatching(/^projectProgrammeForm\.pdfTitle_Puisto_\d{4}-\d{2}-\d{2}\.pdf$/),
    );
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
    expect(props.sections).toHaveLength(6);
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
