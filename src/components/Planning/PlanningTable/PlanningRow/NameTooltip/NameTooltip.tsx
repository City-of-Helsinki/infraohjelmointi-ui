import { FC, memo } from 'react';
import './styles.css';

interface INameTooltipProps {
  value: string;
  id: string;
}

const NameTooltip: FC<INameTooltipProps> = ({ value, id }) => {
  return (
    <section className="tooltip-container" data-testid={`hover-tooltip-${id}`}>
      {value}
      <div className="tooltip-arrow" />
    </section>
  );
};

export default memo(NameTooltip);
