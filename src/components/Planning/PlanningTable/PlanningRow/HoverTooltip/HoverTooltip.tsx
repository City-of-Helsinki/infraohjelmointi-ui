import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';

interface IHoverTooltipProps {
  text?: string | JSX.Element;
  id?: string;
}

interface ITooltipState {
  tooltip: string | JSX.Element;
  rect?: DOMRect | DOMRectReadOnly | null;
}

const HoverTooltip: FC<IHoverTooltipProps> = ({ text, id }) => {
  const [state, setState] = useState<ITooltipState>({ tooltip: text || '', rect: null });
  const { tooltip, rect } = state;
  const elementRef = useRef<HTMLElement>(null);

  const showTooltip = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const { text: tooltipText, rect } = event.detail ?? {};
      if (!tooltipText) {
        return;
      }
      setState({ tooltip: tooltipText, rect });
    },
    [],
  );

  const hideTooltip = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const tooltipText = event.detail?.text ?? '';
      setState({ tooltip: tooltipText, rect: null });
    },
    [],
  );

  useEffect(() => {
    const { current } = elementRef;

    if (!current) {
      return;
    }
    current.addEventListener('showTooltip', showTooltip);
    current.addEventListener('hideTooltip', hideTooltip);
    document.addEventListener('scroll', hideTooltip);

    return () => {
      current.removeEventListener('showTooltip', showTooltip);
      current.removeEventListener('hideTooltip', hideTooltip);
      document.removeEventListener('scroll', hideTooltip);
    };
  }, [elementRef, hideTooltip, showTooltip]);

  useEffect(() => {
    const { current } = elementRef;
    const targetElement = current as HTMLElement;
    if (!current) {
      return;
    }

    if (!tooltip) {
      targetElement.style.display = 'none';
      return;
    }

    if (!rect) {
      // support inline tooltip
      return;
    }
    const { left, top, width } = rect;
    const horizontalCenter = left + width / 2;
    targetElement.style.left = horizontalCenter + 'px';
    targetElement.style.top = top - 15 + 'px';
    targetElement.style.transform = 'translate(-50%, -100%)';
    targetElement.style.position = 'fixed';
    targetElement.style.display = 'block';
  }, [rect, tooltip]);

  return (
    <section
      className="tooltip-container"
      data-testid={`hover-tooltip-${id}`}
      ref={elementRef}
      id="tooltip-view"
    >
      {tooltip}
      <div className="tooltip-arrow-container">
        <div className="tooltip-arrow" />
      </div>
    </section>
  );
};

export default memo(HoverTooltip);
