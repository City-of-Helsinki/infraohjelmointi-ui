import { FontWeightType, IconSizeType, TextColorType } from '@/interfaces/common';
import { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

interface IIconProps {
  icon: FC<{ size?: IconSizeType; color?: string; style?: CSSProperties }>;
  text?: string;
  size?: IconSizeType;
  color?: TextColorType;
  fontWeight?: FontWeightType;
}

const Icon: FC<IIconProps> = ({ size, text, icon, color, fontWeight }) => {
  const { t } = useTranslation();
  const FCIcon = icon;
  const iconSize = size === 'xs' ? '1rem' : '1.5rem';
  return (
    <div className="label-icon-container">
      <FCIcon
        size={size}
        aria-hidden={text ? 'true' : 'false'}
        color={`var(--color-${color || 'black'})`}
        style={{ width: iconSize, height: iconSize }}
      />

      {text && (
        <span
          className={`label-icon-text text-${color || 'black'} text-${
            fontWeight ? fontWeight : ''
          }`}
        >
          {t(text)}
        </span>
      )}
    </div>
  );
};

export default Icon;
