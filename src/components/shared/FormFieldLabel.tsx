import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEventHandler } from 'react';

interface IFormFieldLabel {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

/**
 * Some fields in the forms use this button for editing arrays of strings,
 * could be made more generic?
 */
const FormFieldLabel: FC<IFormFieldLabel> = ({ text, onClick, disabled }) => {
  return (
    <div className="display-flex">
      <label className="pen-and-label-text">{text}</label>
      {onClick && (
        <button
          onClick={onClick}
          disabled={disabled}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          name={text}
          aria-label={text}
        >
          <IconPenLine style={{ transform: 'translate(1.25rem, 0.1875rem)' }} />
        </button>
      )}
    </div>
  );
};

export default FormFieldLabel;
