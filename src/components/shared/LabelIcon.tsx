import { FontWeightType, TextColorType } from '@/interfaces/common';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

type SizeType = 'xl' | 'l' | 'm' | 's' | 'xs';

interface ILabelIconProps {
  text: string;
  icon: FC<{ size?: SizeType | undefined; color?: string }>;
  size?: SizeType;
  color?: TextColorType;
  fontWeight?: FontWeightType;
  id?: string;
}

const LabelIcon: FC<ILabelIconProps> = ({ size, text, icon, color, fontWeight, id }) => {
  const { t } = useTranslation();
  const Icon = icon;
  return (
    <div className="label-icon-container" id={id}>
      <Icon size={size} aria-hidden="true" color={`var(--color-${color || 'black'})`} />
      <span className={`label-icon-text text-${color || 'black'} text-${fontWeight || 'medium'}`}>
        {t(text)}
      </span>
    </div>
  );
};

export default LabelIcon;
