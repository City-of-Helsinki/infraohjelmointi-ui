import mockI18next from '@/mocks/mockI18next';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import AttachmentsAndLinksSection from './AttachmentsAndLinksSection';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import { IConstructionHandoverAttachment } from '@/interfaces/constructionHandoverInterfaces';

const mockIsConfirmed = jest.fn();

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/hooks/useConfirmDialog', () => ({
  __esModule: true,
  default: () => ({
    isConfirmed: mockIsConfirmed,
  }),
}));

const attachments: IConstructionHandoverAttachment[] = [
  {
    id: 'attachment-1',
    handover: 'handover-1',
    downloadUrl: '/construction-handovers/handover-1/attachments/attachment-1/download/',
    objectUrl: 'blob:first',
    originalName: 'first-image.jpg',
    contentType: 'image/jpeg',
    size: 2048,
    uploadedDate: '2026-01-01T12:00:00Z',
  },
  {
    id: 'attachment-2',
    handover: 'handover-1',
    downloadUrl: '/construction-handovers/handover-1/attachments/attachment-2/download/',
    objectUrl: 'blob:second',
    originalName: 'second-image.png',
    contentType: 'image/png',
    size: 4096,
    uploadedDate: '2026-01-02T12:00:00Z',
  },
];

interface ISetupProps {
  attachments?: IConstructionHandoverAttachment[];
  isPostingAttachment?: boolean;
  isHandoverLocked?: boolean;
  onDeleteAttachment?: jest.Mock;
}

function setup({
  attachments: initialAttachments = attachments,
  isPostingAttachment = false,
  isHandoverLocked = false,
  onDeleteAttachment = jest.fn(),
}: ISetupProps = {}) {
  const formRef: { current?: UseFormReturn<IConstructionHandoverForm> } = {};

  function Wrapper() {
    const formMethods = useForm<IConstructionHandoverForm>({
      defaultValues: {
        linkDesignDrawings: '',
        linkCostAllocation: '',
        linkContractBoundaries: '',
      },
    });
    formRef.current = formMethods;

    return (
      <FormProvider {...formMethods}>
        <AttachmentsAndLinksSection
          attachments={initialAttachments}
          isPostingAttachment={isPostingAttachment}
          isHandoverLocked={isHandoverLocked}
          onDeleteAttachment={onDeleteAttachment}
        />
      </FormProvider>
    );
  }

  const user = userEvent.setup();
  render(<Wrapper />);

  return { user, formRef, onDeleteAttachment };
}

describe('AttachmentsAndLinksSection', () => {
  beforeEach(() => {
    mockIsConfirmed.mockReset();
  });

  it('renders link fields', () => {
    setup();

    expect(
      screen.getByLabelText(/constructionHandoverForm\.linkDesignDrawings/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/constructionHandoverForm\.linkCostAllocation/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/constructionHandoverForm\.linkContractBoundaries/),
    ).toBeInTheDocument();
  });

  it('renders a row for every attachment', () => {
    setup();

    expect(screen.getByText(/first-image\.jpg/)).toBeInTheDocument();
    expect(screen.getByText(/second-image\.png/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'attachments.view' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'attachments.delete' })).toHaveLength(2);
  });

  it('does not render attachment rows when there are no attachments', () => {
    setup({ attachments: [] });

    expect(screen.queryByRole('button', { name: 'attachments.view' })).not.toBeInTheDocument();
  });

  it('opens slideshow from clicked attachment using its object url and supports navigation', async () => {
    const { user } = setup();

    await user.click(screen.getAllByRole('button', { name: 'attachments.view' })[1]);

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'second-image.png' })).toHaveAttribute(
      'src',
      'blob:second',
    );

    await user.click(screen.getByLabelText('attachmentSlideshowDialog.nextImage'));

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'first-image.jpg' })).toHaveAttribute(
      'src',
      'blob:first',
    );

    await user.click(screen.getByLabelText('attachmentSlideshowDialog.previousImage'));

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('hides the file input while an attachment is being posted', () => {
    setup({ isPostingAttachment: true });

    expect(screen.queryByLabelText('attachments.dragAndDrop')).not.toBeInTheDocument();
  });

  it('disables the file input and delete buttons when handover is locked', () => {
    setup({ isHandoverLocked: true });

    expect(screen.getByLabelText('attachments.dragAndDrop')).toBeDisabled();
    screen
      .getAllByRole('button', { name: 'attachments.delete' })
      .forEach((button) => expect(button).toBeDisabled());
    screen
      .getAllByRole('button', { name: 'attachments.view' })
      .forEach((button) => expect(button).toBeEnabled());
  });
});
