import mockI18next from '@/mocks/mockI18next';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttachmentSlideshowDialog from './AttachmentSlideshowDialog';

jest.mock('react-i18next', () => mockI18next());

const attachments = [
  {
    id: 'attachment-1',
    name: 'first-image.jpg',
    src: 'https://example.com/first-image.jpg',
  },
  {
    id: 'attachment-2',
    name: 'second-image.jpg',
    src: 'https://example.com/second-image.jpg',
  },
];

describe('AttachmentSlideshowDialog', () => {
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
