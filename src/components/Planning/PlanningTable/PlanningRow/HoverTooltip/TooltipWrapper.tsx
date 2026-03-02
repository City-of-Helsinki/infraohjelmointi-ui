import { useCallback } from 'react';
import { useHoverTooltip } from './useHoverTooltip';
import { Trans } from 'react-i18next';

interface ITooltipWrapperProps {
  className?: string;
  translationKey?: string;
  children: React.ReactNode;
}

export default function TooltipWrapper({
  className,
  translationKey,
  children,
}: ITooltipWrapperProps) {
  const { showTooltip, hideTooltip } = useHoverTooltip();

  const handleShowTooltip = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement>) => {
      if (translationKey) {
        showTooltip(e, <Trans i18nKey={translationKey} />);
      } else {
        showTooltip(e);
      }
    },
    [showTooltip, translationKey],
  );

  return (
    <div
      className={className}
      onMouseEnter={handleShowTooltip}
      onMouseLeave={hideTooltip}
      onFocus={handleShowTooltip}
      onBlur={hideTooltip}
    >
      {children}
    </div>
  );
}
