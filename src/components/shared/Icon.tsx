import { FontWeightType, IconSizeType, TextColorType } from '@/interfaces/common';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

interface IIconProps {
  icon: FC<{ size?: IconSizeType | undefined; color?: string }>;
  text?: string;
  size?: IconSizeType;
  color?: TextColorType;
  fontWeight?: FontWeightType;
}

const Icon: FC<IIconProps> = ({ size, text, icon, color, fontWeight }) => {
  const { t } = useTranslation();
  const FCIcon = icon;
  return (
    <div className="label-icon-container">
      <FCIcon
        size={size}
        aria-hidden={text ? 'true' : 'false'}
        color={`var(--color-${color || 'black'})`}
      />
      {text && (
        <span className={`label-icon-text text-${color || 'black'} text-${fontWeight || 'medium'}`}>
          {t(text)}
        </span>
      )}
    </div>
  );
};

export default Icon;
