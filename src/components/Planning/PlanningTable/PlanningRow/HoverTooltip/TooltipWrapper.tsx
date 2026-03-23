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
}: Readonly<ITooltipWrapperProps>) {
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleShowTooltip(e);
      }

      if (e.key === 'Escape') {
        hideTooltip(e);
      }
    },
    [handleShowTooltip, hideTooltip],
  );

  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onMouseEnter={handleShowTooltip}
      onMouseLeave={hideTooltip}
      onFocus={handleShowTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      onTouchStart={handleShowTooltip}
      onTouchEnd={hideTooltip}
    >
      {children}
    </div>
  );
}
