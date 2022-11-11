import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Using the hds-core helper classes for predefined fonts
 *
 * https://hds.hel.fi/foundation/design-tokens/typography
 * https://github.com/City-of-Helsinki/helsinki-design-system/blob/master/packages/core/src/utils/helpers.css
 */

type SizeType = 'xl' | 'l' | 'm' | 's';

interface ISpanProps {
  size: SizeType;
  text: string;
}

const Span: FC<ISpanProps> = ({ size, text }) => {
  const { t } = useTranslation();
  return <span className={`font-${size}`}>{t(text)}</span>;
};

export default Span;
