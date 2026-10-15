import mockI18next from '@/mocks/mockI18next';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttachmentSlideshowDialog from './AttachmentSlideshowDialog';
import mockNoteImages from '@/mocks/mockNoteImages';

jest.mock('react-i18next', () => mockI18next());

const attachments = mockNoteImages;

describe('AttachmentSlideshowDialog', () => {
  it('shows a single image without navigation or a counter', () => {
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    const { getByRole, queryByText, queryByLabelText } = render(
      <AttachmentSlideshowDialog
        isOpen
        attachments={[{ fileName: 'preview.jpg', downloadUrl: 'https://example.com/preview.jpg' }]}
        selectedIndex={0}
        onClose={jest.fn()}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    expect(getByRole('img')).toHaveAttribute('src', 'https://example.com/preview.jpg');
    expect(getByRole('img')).toHaveAttribute('alt', 'preview.jpg');
    expect(queryByText('1 / 1')).not.toBeInTheDocument();
    expect(queryByLabelText('attachmentSlideshowDialog.previousImage')).not.toBeInTheDocument();
    expect(queryByLabelText('attachmentSlideshowDialog.nextImage')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('supports attachments and navigation with no callbacks', () => {
    const { getByRole, getByLabelText } = render(
      <AttachmentSlideshowDialog
        isOpen
        attachments={[{ fileName: 'first.jpg' }, { fileName: 'second.jpg' }]}
        selectedIndex={0}
        onClose={jest.fn()}
      />,
    );

    expect(getByRole('img')).toHaveAttribute('alt', 'first.jpg');
    fireEvent.click(getByLabelText('attachmentSlideshowDialog.previousImage'));
    fireEvent.click(getByLabelText('attachmentSlideshowDialog.nextImage'));
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
  });

  it.each(['previous', 'next'])('supports only the %s navigation callback', (direction) => {
    const onNavigate = jest.fn();
    const { getByLabelText } = render(
      <AttachmentSlideshowDialog
        isOpen
        attachments={[{ fileName: 'first.jpg' }, { fileName: 'second.jpg' }]}
        selectedIndex={0}
        onClose={jest.fn()}
        onPrevious={direction === 'previous' ? onNavigate : undefined}
        onNext={direction === 'next' ? onNavigate : undefined}
      />,
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledTimes(1);

    fireEvent.click(getByLabelText('attachmentSlideshowDialog.previousImage'));
    fireEvent.click(getByLabelText('attachmentSlideshowDialog.nextImage'));
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('removes keyboard navigation listeners when closed or unmounted', () => {
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    const props = {
      attachments,
      selectedIndex: 0,
      onClose: jest.fn(),
      onPrevious,
      onNext,
    };
    const { rerender, unmount } = render(<AttachmentSlideshowDialog {...props} isOpen />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onNext).toHaveBeenCalledTimes(1);

    rerender(<AttachmentSlideshowDialog {...props} isOpen={false} />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);

    rerender(<AttachmentSlideshowDialog {...props} isOpen />);
    unmount();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('returns null when selected attachment does not exist', () => {
    const { container } = render(
      <AttachmentSlideshowDialog
        isOpen
        attachments={attachments}
        selectedIndex={10}
        onClose={jest.fn()}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('calls close, previous and next handlers from buttons', async () => {
    const onClose = jest.fn();
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    const user = userEvent.setup();

    const { getByRole, getByLabelText } = render(
      <AttachmentSlideshowDialog
        isOpen
        attachments={attachments}
        selectedIndex={0}
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    await user.click(getByLabelText('attachmentSlideshowDialog.previousImage'));
    await user.click(getByLabelText('attachmentSlideshowDialog.nextImage'));
    await user.click(getByRole('button', { name: 'attachmentSlideshowDialog.close' }));

    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('responds to keyboard navigation only when open', () => {
    const onClose = jest.fn();
    const onPrevious = jest.fn();
    const onNext = jest.fn();

    const { rerender } = render(
      <AttachmentSlideshowDialog
        isOpen={false}
        attachments={attachments}
        selectedIndex={0}
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();

    rerender(
      <AttachmentSlideshowDialog
        isOpen
        attachments={attachments}
        selectedIndex={0}
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
