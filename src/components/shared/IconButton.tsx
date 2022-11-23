import { FontWeightType, IconSizeType, TextColorType } from '@/interfaces/common';
import { FC, MouseEventHandler } from 'react';
import Icon from './Icon';

interface IIconButton {
  onClick: MouseEventHandler<HTMLButtonElement>;
  icon: FC<{ size?: IconSizeType; color?: string }>;
  text?: string;
  size?: IconSizeType;
  color?: TextColorType;
  fontWeight?: FontWeightType;
  label?: string;
}

const IconButton: FC<IIconButton> = (props) => {
  const { onClick, ...iconProps } = props;
  return (
    <button onClick={onClick} aria-label={iconProps.text || iconProps.label}>
      <Icon {...iconProps} />
    </button>
  );
};

export default IconButton;
