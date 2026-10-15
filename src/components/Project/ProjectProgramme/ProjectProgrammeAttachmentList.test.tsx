import mockI18next from '@/mocks/mockI18next';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import type {
  IProjectProgrammeAttachment,
  IProjectProgrammeForm,
} from '@/interfaces/projectProgrammeInterfaces';
import { FormMode } from '@/interfaces/formInterfaces';
import { notifyError } from '@/reducers/notificationSlice';
import ProjectProgrammeAttachmentList from './ProjectProgrammeAttachmentList';
import { ProjectProgrammeSectionId } from './sections/projectProgrammeSections';

const mockDispatch = jest.fn();
const mockGetBlob = jest.fn();
const mockIsConfirmed = jest.fn();

jest.mock('react-i18next', () => mockI18next());
jest.mock('@/hooks/common', () => ({ useAppDispatch: () => mockDispatch }));
jest.mock('@/hooks/useConfirmDialog', () => ({
  __esModule: true,
  default: () => ({ isConfirmed: mockIsConfirmed }),
}));
jest.mock('@/api/projectProgrammeApi', () => ({
  getProjectProgrammeAttachmentBlob: (...args: unknown[]) => mockGetBlob(...args),
}));

const firstImage: IProjectProgrammeAttachment = {
  id: 'first',
  originalName: 'first.jpg',
  contentType: 'image/jpeg',
  downloadUrl: '/attachments/first/',
};
const secondImage: IProjectProgrammeAttachment = {
  id: 'second',
  originalName: 'second.PNG',
  downloadUrl: '/attachments/second/',
};
const pdf: IProjectProgrammeAttachment = {
  id: 'pdf',
  originalName: 'plan.pdf',
  contentType: 'application/pdf',
  downloadUrl: '/attachments/pdf/',
};
const word: IProjectProgrammeAttachment = {
  id: 'word',
  originalName: 'plan.docx',
  downloadUrl: '/attachments/word/',
};

function AttachmentForm({
  attachments = [firstImage, pdf, secondImage, word],
  removedAttachmentIds = [],
  mode = 'edit',
  section = 'otherAttachments',
}: {
  attachments?: IProjectProgrammeAttachment[];
  removedAttachmentIds?: string[];
  mode?: FormMode;
  section?: ProjectProgrammeSectionId;
}) {
  const form = useForm<IProjectProgrammeForm>({
    defaultValues: { [section]: { attachments, removedAttachmentIds } },
  });
  return (
    <FormProvider {...form}>
      <ProjectProgrammeAttachmentList
        projectProgrammeId="programme-1"
        section={section}
        mode={mode}
      />
    </FormProvider>
  );
}

function createDeferredBlob() {
  let resolvePromise: ((blob: Blob) => void) | undefined;
  let rejectPromise: ((reason: Error) => void) | undefined;
  const promise = new Promise<Blob>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return {
    promise,
    resolve: (blob: Blob) => {
      if (!resolvePromise) throw new Error('Deferred promise is not initialized');
      resolvePromise(blob);
    },
    reject: (error: Error) => {
      if (!rejectPromise) throw new Error('Deferred promise is not initialized');
      rejectPromise(error);
    },
  };
}

function showButtons() {
  return screen.getAllByRole('button', {
    name: 'projectProgrammeForm.showAttachmentAriaLabel',
  });
}

async function closePreview(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'attachmentSlideshowDialog.close',
    }),
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}

describe('ProjectProgrammeAttachmentList preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBlob.mockReset();
    mockGetBlob.mockResolvedValue(new Blob(['image'], { type: 'image/png' }));
    mockIsConfirmed.mockResolvedValue(true);
    let urlIndex = 0;
    URL.createObjectURL = jest.fn(() => `blob:preview-${++urlIndex}`);
    URL.revokeObjectURL = jest.fn();
  });

  it.each<ProjectProgrammeSectionId>(['otherAttachments', 'designCriteria'])(
    'opens %s images lazily and navigates only images with wraparound',
    async (section) => {
      const user = userEvent.setup();
      render(<AttachmentForm section={section} />);
      expect(mockGetBlob).not.toHaveBeenCalled();
      await user.click(showButtons()[2]);

      expect(await screen.findByRole('img', { name: 'second.PNG' })).toHaveAttribute(
        'src',
        'blob:preview-1',
      );
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
      expect(mockGetBlob).toHaveBeenCalledTimes(1);
      expect(mockGetBlob).toHaveBeenLastCalledWith(secondImage.downloadUrl);

      await user.click(screen.getByLabelText('attachmentSlideshowDialog.nextImage'));
      expect(await screen.findByRole('img', { name: 'first.jpg' })).toHaveAttribute(
        'src',
        'blob:preview-2',
      );
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
      expect(mockGetBlob).toHaveBeenLastCalledWith(firstImage.downloadUrl);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');

      await user.click(screen.getByLabelText('attachmentSlideshowDialog.previousImage'));
      expect(await screen.findByRole('img', { name: 'second.PNG' })).toBeInTheDocument();
      expect(screen.getByText('2 / 2')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(await screen.findByRole('img', { name: 'first.jpg' })).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(await screen.findByRole('img', { name: 'second.PNG' })).toBeInTheDocument();

      await closePreview(user);
      const requestCount = mockGetBlob.mock.calls.length;
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(mockGetBlob).toHaveBeenCalledTimes(requestCount);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-5');

      await user.click(showButtons()[0]);
      expect(await screen.findByRole('img', { name: 'first.jpg' })).toBeInTheDocument();
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    },
  );

  it('uses Notes styling and top-right close control without a header or footer actions', async () => {
    const user = userEvent.setup();
    render(<AttachmentForm />);
    await user.click(showButtons()[0]);

    const dialog = await screen.findByRole('dialog', { name: firstImage.originalName });
    expect(dialog).toHaveStyle({ maxWidth: '1200px', width: '80vw' });
    const image = within(dialog).getByRole('img', { name: firstImage.originalName });
    expect(image).toHaveClass('max-h-[70vh]', 'w-full', 'rounded-sm', 'object-contain');
    const content = screen.getByTestId('attachment-preview-content');
    expect(content.parentElement).toHaveStyle({
      padding: '14px 24px 24px',
      position: 'relative',
    });
    const close = within(dialog).getByRole('button', { name: 'attachmentSlideshowDialog.close' });
    expect(close.parentElement).toHaveClass('absolute', 'right-8', 'top-6');
    expect(within(dialog).getAllByRole('button')).toHaveLength(3);
    expect(within(dialog).queryByRole('heading')).not.toBeInTheDocument();
    await closePreview(user);
  });

  it('excludes removed and unavailable images and disables single-image navigation', async () => {
    const user = userEvent.setup();
    render(
      <AttachmentForm
        attachments={[
          firstImage,
          secondImage,
          { ...firstImage, id: 'missing', downloadUrl: undefined },
        ]}
        removedAttachmentIds={[secondImage.id]}
      />,
    );
    expect(screen.queryByText(secondImage.originalName)).not.toBeInTheDocument();
    await user.click(showButtons()[0]);
    expect(await screen.findByText('1 / 1')).toBeInTheDocument();
    expect(screen.getByLabelText('attachmentSlideshowDialog.previousImage')).toBeDisabled();
    expect(screen.getByLabelText('attachmentSlideshowDialog.nextImage')).toBeDisabled();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockGetBlob).toHaveBeenCalledTimes(1);
  });

  it('retains PDF embedding without image navigation or a footer close button', async () => {
    const user = userEvent.setup();
    mockGetBlob.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
    render(<AttachmentForm />);
    await user.click(showButtons()[1]);
    expect(await screen.findByTitle(pdf.originalName)).toHaveAttribute('src', 'blob:preview-1');
    expect(screen.getByTitle(pdf.originalName).parentElement).toHaveClass('w-full', 'pt-20');
    expect(screen.queryByLabelText('attachmentSlideshowDialog.nextImage')).not.toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getAllByRole('button')).toHaveLength(1);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockGetBlob).toHaveBeenCalledTimes(1);
    await closePreview(user);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
  });

  it('retains unsupported-file download links', async () => {
    const user = userEvent.setup();
    mockGetBlob.mockResolvedValue(new Blob(['word']));
    render(<AttachmentForm />);
    await user.click(showButtons()[3]);
    const download = await screen.findByRole('link', {
      name: 'projectProgrammeForm.downloadAttachment',
    });
    expect(download).toHaveAttribute('href', 'blob:preview-1');
    expect(download).toHaveAttribute('download', word.originalName);
    expect(download.parentElement).toHaveClass('w-full', 'pt-20');
    expect(
      screen.getByText('projectProgrammeForm.attachmentPreviewNotSupported'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('attachmentSlideshowDialog.nextImage')).not.toBeInTheDocument();
    await closePreview(user);
  });

  it('does not let an older download replace a newer selection', async () => {
    const firstDownload = createDeferredBlob();
    const secondDownload = createDeferredBlob();
    mockGetBlob
      .mockReturnValueOnce(firstDownload.promise)
      .mockReturnValueOnce(secondDownload.promise);
    const user = userEvent.setup();
    render(<AttachmentForm />);

    await user.click(showButtons()[0]);
    await user.click(showButtons()[2]);
    await act(async () => secondDownload.resolve(new Blob(['second'], { type: 'image/png' })));
    expect(await screen.findByRole('img', { name: secondImage.originalName })).toBeInTheDocument();
    await act(async () => firstDownload.resolve(new Blob(['first'], { type: 'image/jpeg' })));
    expect(screen.getByRole('img', { name: secondImage.originalName })).toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('keeps the displayed image valid while loading and ignores completion after closing', async () => {
    const nextDownload = createDeferredBlob();
    mockGetBlob
      .mockResolvedValueOnce(new Blob(['first']))
      .mockReturnValueOnce(nextDownload.promise);
    const user = userEvent.setup();
    render(<AttachmentForm />);
    await user.click(showButtons()[0]);
    await screen.findByRole('img', { name: firstImage.originalName });
    await user.click(screen.getByLabelText('attachmentSlideshowDialog.nextImage'));

    expect(screen.getByRole('img', { name: firstImage.originalName })).toHaveAttribute(
      'src',
      'blob:preview-1',
    );
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    await closePreview(user);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');

    await act(async () => nextDownload.resolve(new Blob(['second'])));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('uses the latest target during rapid carousel navigation', async () => {
    const nextDownload = createDeferredBlob();
    mockGetBlob
      .mockResolvedValueOnce(new Blob(['first']))
      .mockReturnValueOnce(nextDownload.promise)
      .mockResolvedValueOnce(new Blob(['first again']));
    const user = userEvent.setup();
    render(<AttachmentForm />);
    await user.click(showButtons()[0]);
    await screen.findByRole('img', { name: firstImage.originalName });
    await user.click(screen.getByLabelText('attachmentSlideshowDialog.nextImage'));
    await user.click(screen.getByLabelText('attachmentSlideshowDialog.nextImage'));

    await waitFor(() =>
      expect(screen.getByRole('img', { name: firstImage.originalName })).toHaveAttribute(
        'src',
        'blob:preview-2',
      ),
    );
    expect(mockGetBlob).toHaveBeenLastCalledWith(firstImage.downloadUrl);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');

    await act(async () => nextDownload.resolve(new Blob(['second'])));
    expect(screen.getByRole('img', { name: firstImage.originalName })).toHaveAttribute(
      'src',
      'blob:preview-2',
    );
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
  });

  it('ignores stale failures while reporting active download failures', async () => {
    const staleDownload = createDeferredBlob();
    mockGetBlob.mockReturnValueOnce(staleDownload.promise);
    const user = userEvent.setup();
    render(<AttachmentForm />);
    await user.click(showButtons()[0]);
    await user.click(showButtons()[2]);
    await screen.findByRole('img', { name: secondImage.originalName });
    await act(async () => staleDownload.reject(new Error('Stale failure')));
    expect(mockDispatch).not.toHaveBeenCalled();

    mockGetBlob.mockRejectedValueOnce(new Error('Download failed'));
    await user.click(screen.getByLabelText('attachmentSlideshowDialog.nextImage'));
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        notifyError({
          title: 'loadError',
          message: 'projectProgrammeAttachmentLoadError',
          type: 'toast',
        }),
      ),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
  });

  it('revokes the active URL on unmount and does not create URLs for unmounted requests', async () => {
    const nextDownload = createDeferredBlob();
    mockGetBlob
      .mockResolvedValueOnce(new Blob(['first']))
      .mockReturnValueOnce(nextDownload.promise);
    const user = userEvent.setup();
    const { unmount } = render(<AttachmentForm />);
    await user.click(showButtons()[0]);
    await screen.findByRole('img', { name: firstImage.originalName });
    await user.click(screen.getByLabelText('attachmentSlideshowDialog.nextImage'));
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
    await act(async () => nextDownload.resolve(new Blob(['second'])));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('preserves deletion confirmation and read-only preview behavior', async () => {
    const user = userEvent.setup();
    mockIsConfirmed.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { unmount } = render(<AttachmentForm />);
    const deleteButtons = () =>
      screen.getAllByRole('button', { name: 'projectProgrammeForm.deleteAttachmentAriaLabel' });

    await user.click(deleteButtons()[0]);
    expect(screen.getByText(firstImage.originalName)).toBeInTheDocument();
    await user.click(deleteButtons()[0]);
    expect(screen.queryByText(firstImage.originalName)).not.toBeInTheDocument();
    await user.click(showButtons()[1]);
    expect(await screen.findByText('1 / 1')).toBeInTheDocument();
    unmount();

    render(<AttachmentForm mode="view" />);
    expect(
      screen.queryByRole('button', { name: 'projectProgrammeForm.deleteAttachmentAriaLabel' }),
    ).not.toBeInTheDocument();
    await user.click(showButtons()[0]);
    expect(await screen.findByRole('img', { name: firstImage.originalName })).toBeInTheDocument();
  });
});
