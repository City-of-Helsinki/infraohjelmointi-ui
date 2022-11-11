import React, { FC } from 'react';
import { useWindowSize } from '@/hooks/common';
import { useTranslation } from 'react-i18next';

/**
 * Using the hds-core helper classes for predefined fonts
 *
 * https://hds.hel.fi/foundation/design-tokens/typography
 * https://github.com/City-of-Helsinki/helsinki-design-system/blob/master/packages/core/src/utils/helpers.css
 */

type SizeType = 'xxl' | 'xl' | 'l' | 'm' | 's' | 'xs' | 'xxs';

interface ITitleProps {
  size: SizeType;
  text: string;
}

const Title: FC<ITitleProps> = ({ size, text }) => {
  const [width] = useWindowSize();
  const { t } = useTranslation();

  // Use window width with the default medium breakpoint from City of Helsinki to change font sizes
  const getHeading = () => {
    const breakpoint = 768;
    const isMobile = width < breakpoint;
    switch (size) {
      case 'xxl':
        return <h1 className={`heading-${isMobile ? 'xl-mobile' : size}`}>{t(text)}</h1>;
      case 'xl':
        return <h2 className={`heading-${isMobile ? 'l' : size}`}>{t(text)}</h2>;
      case 'l':
        return <h3 className={`heading-${isMobile ? 'm' : size}`}>{t(text)}</h3>;
      case 'm':
        return <h4 className={`heading-${isMobile ? 's' : size}`}>{t(text)}</h4>;
      case 's':
        return <h5 className={`heading-${isMobile ? 'xs' : size}`}>{t(text)}</h5>;
      case 'xs':
        return <h6 className={`heading-${isMobile ? 'xxs' : size}`}>{t(text)}</h6>;
      case 'xxs':
        return <h6 className={`heading-${size}`}>{t(text)}</h6>;
    }
  };

  return getHeading();
};

export default Title;
