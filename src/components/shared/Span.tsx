import { FontWeightType, TextColorType } from '@/interfaces/common';
import { FC } from 'react';

/**
 * Using the hds-core helper classes for predefined fonts
 *
 * https://hds.hel.fi/foundation/design-tokens/typography
 * https://github.com/City-of-Helsinki/helsinki-design-system/blob/master/packages/core/src/utils/helpers.css
 */

type SizeType = 'xl' | 'l' | 'm' | 's';

interface ISpanProps {
  text: string;
  color?: TextColorType;
  fontWeight?: FontWeightType;
  id?: string;
  size?: SizeType;
}

const Span: FC<ISpanProps> = ({ size, text, color, fontWeight, id }) => {
  return (
    <span
      data-testid={id}
      className={`font-${size || 'm'} text-${color || 'black'} text-${fontWeight || 'medium'}`}
    >
      {text}
    </span>
  );
};

export default Span;
