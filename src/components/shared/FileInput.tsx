import { Language } from '@/i18n/language';
import { FileInput as HDSFileInput } from 'hds-react';
import { useTranslation } from 'react-i18next';

interface IFileInputProps {
  id: string;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  handleChange: (files: File[] | null) => void;
}

export default function FileInput({
  id,
  maxSize = 512288,
  accept = '.jpg,.png',
  multiple = true,
  disabled,
  handleChange,
}: Readonly<IFileInputProps>) {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <div className="mb-6 w-full">
      <HDSFileInput
        id={id}
        data-testid={id}
        label={t('attachments.dragAndDrop')}
        language={language as Language}
        maxSize={maxSize}
        accept={accept}
        dragAndDrop
        onChange={handleChange}
        multiple={multiple}
        disabled={disabled}
      />
    </div>
  );
}
