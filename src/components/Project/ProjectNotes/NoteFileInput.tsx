import { Language } from '@/i18n/language';
import { FileInput } from 'hds-react';
import { useTranslation } from 'react-i18next';

interface INoteFileInputProps {
  handleChange: (files: File[] | null) => void;
}

export default function NoteFileInput({ handleChange }: Readonly<INoteFileInputProps>) {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <div className="mb-6 w-full">
      <FileInput
        id="note-file-input"
        data-testid="note-file-input"
        label={t('noteAttachments.dragAndDrop')}
        language={language as Language}
        maxSize={512288}
        accept=".jpg,.png"
        dragAndDrop
        onChange={handleChange}
        multiple
      />
    </div>
  );
}
