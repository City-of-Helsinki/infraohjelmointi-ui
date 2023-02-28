import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

interface IFormFieldLabel {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  dataTestId?: string;
}

/**
 * Some fields in the forms use this button for editing arrays of strings,
 * could be made more generic?
 */
const FormFieldLabel: FC<IFormFieldLabel> = ({ text, onClick, disabled, dataTestId }) => {
  const { t } = useTranslation();
  return (
    <div className="flex">
      <label className="pen-and-label-text">{t(text)}</label>
      {onClick && (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          name={text}
          aria-label={text}
          data-testid={dataTestId}
        >
          <IconPenLine style={{ transform: 'translate(1.25rem, -0.18rem)' }} />
        </button>
      )}
    </div>
  );
};

export default FormFieldLabel;
