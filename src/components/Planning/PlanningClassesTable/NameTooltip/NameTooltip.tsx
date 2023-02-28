import { FC, memo } from 'react';
import './styles.css';

interface INameTooltipProps {
  value: string;
}

const NameTooltip: FC<INameTooltipProps> = ({ value }) => {
  return (
    <section className="tooltip-container">
      {value}
      <div className="tooltip-arrow" />
    </section>
  );
};

export default memo(NameTooltip);
