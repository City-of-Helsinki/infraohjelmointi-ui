import { FC, memo } from 'react';
import './styles.css';

interface IHoverTooltipProps {
  text: string;
  id: string;
}

const HoverTooltip: FC<IHoverTooltipProps> = ({ text, id }) => {
  return (
    <section className="tooltip-container" data-testid={`hover-tooltip-${id}`}>
      {text}
      <div className="tooltip-arrow" />
    </section>
  );
};

export default memo(HoverTooltip);
