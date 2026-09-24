import mockI18next from '@/mocks/mockI18next';
import { render } from '@testing-library/react';
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

    expect(getByText('noteAttachments.imageAttachments')).toBeInTheDocument();
    expect(getByText('first-image.jpg')).toBeInTheDocument();
    expect(getByText('second-image.jpg')).toBeInTheDocument();
    expect(getAllByRole('button', { name: 'noteAttachments.view' })).toHaveLength(2);
  });

  it('opens slideshow from clicked attachment index and supports navigation', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByText, getByLabelText } = render(
      <NoteAttachmentList attachments={attachments} />,
    );

    await user.click(getAllByRole('button', { name: 'noteAttachments.view' })[1]);

    expect(getByText('2 / 2')).toBeInTheDocument();

    await user.click(getByLabelText('attachmentSlideshowDialog.previousImage'));
    expect(getByText('1 / 2')).toBeInTheDocument();

    await user.click(getByLabelText('attachmentSlideshowDialog.nextImage'));
    expect(getByText('2 / 2')).toBeInTheDocument();
  });
});
