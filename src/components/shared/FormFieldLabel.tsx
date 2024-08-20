import { Button } from 'hds-react';
import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

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
    <>
      {!onClick ? (
        <label className="pen-and-label-text">{t(text)}</label>
      ) : (
        <Button
          iconRight={<IconPenLine />}
          variant="supplementary"
          className="pen-and-label-button"
          onClick={onClick}
          disabled={disabled}
          name={text}
          aria-label={text}
          data-testid={dataTestId}
        >
          {text}
        </Button>
      )}
    </>
  );
};

export default FormFieldLabel;
