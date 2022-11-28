import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEventHandler } from 'react';

interface IPenAndLabelProps {
  text: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

/**
 * Some fields in the forms use this button for editing arrays of strings,
 * could be made more generic?
 */
const PenAndLabelButton: FC<IPenAndLabelProps> = ({ text, onClick, disabled }) => {
  return (
    <div style={{ display: 'flex' }}>
      <label>{text}</label>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        name={text}
        aria-label={text}
      >
        <IconPenLine style={{ transform: 'translate(20px, -3px)' }} />
      </button>
    </div>
  );
};

export default PenAndLabelButton;
