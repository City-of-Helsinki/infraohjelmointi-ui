import mockI18next from '@/mocks/mockI18next';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteAttachmentList from './NoteAttachmentList';
import mockNoteImages from '@/mocks/mockNoteImages';

jest.mock('react-i18next', () => mockI18next());

const attachments = mockNoteImages;

describe('NoteAttachmentList', () => {
  it('returns null when there are no attachments', () => {
    const { container } = render(<NoteAttachmentList attachments={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders attachment rows', () => {
    const { getByText, getAllByRole } = render(<NoteAttachmentList attachments={attachments} />);

    expect(getByText('attachments.imageAttachments')).toBeInTheDocument();
    expect(getByText('first-image.jpg')).toBeInTheDocument();
    expect(getByText('second-image.jpg')).toBeInTheDocument();
    expect(getAllByRole('button', { name: 'attachments.view' })).toHaveLength(2);
  });

  it('opens slideshow from clicked attachment index and supports navigation', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByText, getByLabelText } = render(
      <NoteAttachmentList attachments={attachments} />,
    );

    await user.click(getAllByRole('button', { name: 'attachments.view' })[1]);

    expect(getByText('2 / 2')).toBeInTheDocument();

    await user.click(getByLabelText('attachmentSlideshowDialog.previousImage'));
    expect(getByText('1 / 2')).toBeInTheDocument();

    await user.click(getByLabelText('attachmentSlideshowDialog.nextImage'));
    expect(getByText('2 / 2')).toBeInTheDocument();
  });

  it('wraps navigation and reopens the image selected from a thumbnail', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByRole, getByText, queryByRole, getByLabelText } = render(
      <NoteAttachmentList attachments={attachments} />,
    );

    await user.click(getAllByRole('button', { name: 'attachments.view' })[1]);
    expect(getByRole('img', { name: attachments[1].fileName })).toBeInTheDocument();

    await user.click(getByLabelText('attachmentSlideshowDialog.nextImage'));
    expect(getByText('1 / 2')).toBeInTheDocument();
    expect(getByRole('img', { name: attachments[0].fileName })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(getByText('2 / 2')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(getByText('1 / 2')).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'attachmentSlideshowDialog.close' }));
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    await user.click(getAllByRole('button', { name: 'attachments.viewAttachment' })[1]);
    expect(getByText('2 / 2')).toBeInTheDocument();
    expect(getByRole('img', { name: attachments[1].fileName })).toBeInTheDocument();
  });
});
