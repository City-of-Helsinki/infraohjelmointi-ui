import { FC, memo, ReactNode } from 'react';
import { Dialog } from 'hds-react';

interface IDialogWrapperProps {
  isOpen: boolean;
  name: string;
  title: string;
  icon: JSX.Element;
  children: ReactNode;
  variant?: 'danger';
  size?: 'l';
}

const DialogWrapper: FC<IDialogWrapperProps> = ({
  isOpen,
  name,
  title,
  icon,
  variant,
  children,
  size,
}) => (
  <Dialog
    id={`${name}-dialog`}
    aria-labelledby={`${name}-dialog`}
    isOpen={isOpen}
    variant={variant || 'primary'}
    className={size === 'l' ? 'big-dialog' : ''}
  >
    <Dialog.Header id={`${name}-dialog-header`} title={title} iconStart={icon} />
    {children}
  </Dialog>
);

export default memo(DialogWrapper);
