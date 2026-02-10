import { useCallback } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectHoverTooltipsEnabled } from '@/reducers/planningSlice';
import { dispatchTooltipEvent } from '@/utils/events';

export function useHoverTooltip() {
  const hoverTooltipsEnabled = useAppSelector(selectHoverTooltipsEnabled);

  const showTooltip = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, content?: string | JSX.Element) => {
      if (!hoverTooltipsEnabled) {
        return;
      }
      const targetElement = event.target as HTMLElement;
      const text = content ?? targetElement.textContent ?? targetElement.innerText;
      dispatchTooltipEvent(event, 'show', { text });
    },
    [hoverTooltipsEnabled],
  );

  const hideTooltip = useCallback((event: React.SyntheticEvent<HTMLElement>) => {
    dispatchTooltipEvent(event, 'hide', { text: '' });
  }, []);

  return { showTooltip, hideTooltip };
}
