import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';

interface IHoverTooltipProps {
  text?: string;
  id?: string;
}

const HoverTooltip: FC<IHoverTooltipProps> = ({ text, id }) => {
  const [state, setState] = useState({ tooltip: text || '', sourceEvent: undefined });
  const { tooltip } = state;
  // const [tooltip, setTooltip] = useState<string>(text || '');
  const elementRef = useRef<HTMLElement>(null);

  const showTooltip = useCallback(
    (event: any) => {
      if (tooltip !== event.detail.text) {
        setState({ tooltip: event.detail.text, sourceEvent: event.detail.event });
      }
    },
    [elementRef.current],
  );
  const hideTooltip = useCallback(
    (event: any) => {
      setState({ tooltip: event.detail?.text, sourceEvent: event });
    },
    [elementRef.current],
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
  }, [elementRef]);

  useEffect(() => {
    const { current } = elementRef;
    const targetElement = current as HTMLElement;
    const { tooltip, sourceEvent: e } = state;
    if (!current) {
      return;
    }

    if (!tooltip) {
      targetElement.style.display = 'none';
      (targetElement.children[0] as HTMLElement).style.display = 'none';
      return;
    }

    if (!e) {
      // support inline tooltip
      return;
    }

    const { offsetX, offsetY } = (e as any).nativeEvent;
    const { clientX: left, clientY: top } = e as any;
    const x = left - offsetX;
    const y = top - offsetY;
    targetElement.style.left = x + 'px';
    targetElement.style.top = y - 68 + 'px';
    targetElement.style.position = 'fixed';
    targetElement.style.display = 'block';
    targetElement.style.height = '60px';
    (targetElement.children[0] as HTMLElement).style.display = 'block';
  }, [state]);

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
