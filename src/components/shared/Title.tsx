import { FC } from 'react';
import { useWindowSize } from '@/hooks/common';
import { useTranslation } from 'react-i18next';
import { TextColorType } from '@/interfaces/common';

/**
 * Using the hds-core helper classes for predefined fonts
 *
 * https://hds.hel.fi/foundation/design-tokens/typography
 * https://github.com/City-of-Helsinki/helsinki-design-system/blob/master/packages/core/src/utils/helpers.css
 */

type SizeType = 'xxl' | 'xl' | 'l' | 'm' | 's' | 'xs' | 'xxs';

interface ITitleProps {
  size: SizeType;
  text: string | undefined;
  color?: TextColorType;
  id?: string;
}

const Title: FC<ITitleProps> = ({ size, text, color, id }) => {
  const [width] = useWindowSize();
  const { t } = useTranslation();

  // Use window width with the default medium breakpoint from City of Helsinki to change font sizes
  const getHeading = () => {
    const breakpoint = 768;
    const isMobile = width < breakpoint;
    // This "hacky" approach creates classes instead of inline-styles, since we are using HDS-core tokens
    const createClasses = (size: string) =>
      `heading-${size} ${color ? `text-${color}` : 'text-black'} margin-0`;

    switch (size) {
      case 'xxl':
        return <h1 className={createClasses(isMobile ? 'xl-mobile' : size)}>{t(text || '')}</h1>;
      case 'xl':
        return <h2 className={createClasses(isMobile ? 'l' : size)}>{t(text || '')}</h2>;
      case 'l':
        return <h3 className={createClasses(isMobile ? 'm' : size)}>{t(text || '')}</h3>;
      case 'm':
        return <h4 className={createClasses(isMobile ? 's' : size)}>{t(text || '')}</h4>;
      case 's':
        return <h5 className={createClasses(isMobile ? 'xs' : size)}>{t(text || '')}</h5>;
      case 'xs':
        return <h6 className={createClasses(isMobile ? 'xxs' : size)}>{t(text || '')}</h6>;
      case 'xxs':
        return <h6 className={createClasses(size)}>{t(text || '')}</h6>;
    }
  };

  return <div data-testid={id}>{getHeading()}</div>;
};

export default Title;
