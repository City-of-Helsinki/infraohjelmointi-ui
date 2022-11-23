import { FontWeightType, TextColorType } from '@/interfaces/common';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Using the hds-core helper classes for predefined fonts
 *
 * https://hds.hel.fi/foundation/design-tokens/typography
 * https://github.com/City-of-Helsinki/helsinki-design-system/blob/master/packages/core/src/utils/helpers.css
 */

type SizeType = 'xl' | 'l' | 'm' | 's';

interface IParagraphProps {
  size: SizeType;
  text: string;
  color?: TextColorType;
  fontWeight?: FontWeightType;
}

const Paragraph: FC<IParagraphProps> = ({ size, text, color, fontWeight }) => {
  const { t } = useTranslation();
  return (
    <p className={`font-${size} text-${color || 'black'} text-${fontWeight || 'medium'}`}>
      {t(text)}
    </p>
  );
};

export default Paragraph;
