import { useCallback } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectChangeHistoryEnabled, selectHoverTooltipsEnabled } from '@/reducers/planningSlice';
import { dispatchTooltipEvent } from '@/utils/events';

export function useHoverTooltip() {
  const hoverTooltipsEnabled = useAppSelector(selectHoverTooltipsEnabled);
  // While change-history mode (IO-881) is active the cells show audit popovers
  // instead of the regular info tooltips, so the latter are suppressed.
  const changeHistoryEnabled = useAppSelector(selectChangeHistoryEnabled);

  const showTooltip = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, content?: string | JSX.Element) => {
      if (!hoverTooltipsEnabled || changeHistoryEnabled) {
        return;
      }
      const targetElement = event.target as HTMLElement;
      const text = content ?? targetElement.textContent ?? targetElement.innerText;
      dispatchTooltipEvent(event, 'show', { text });
    },
    [hoverTooltipsEnabled, changeHistoryEnabled],
  );

  const hideTooltip = useCallback((event: React.SyntheticEvent<HTMLElement>) => {
    dispatchTooltipEvent(event, 'hide', { text: '' });
  }, []);

  return { showTooltip, hideTooltip };
}
