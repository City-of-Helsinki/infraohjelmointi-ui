import { CSSProperties, FC } from 'react';
import './styles.css';

interface IProgressCircleProps {
  percent: number;
  color: string;
}

/** Indicates a progress in percentages, svg will scale to parent container */
const ProgressCircle: FC<IProgressCircleProps> = ({ color, percent }) => {
  const circleDimensions = {
    cx: 60,
    cy: 60,
    r: 40,
    pathLength: 100,
  };

  const circlePercent = { '--circle-percent': percent, stroke: `var(${color})` } as CSSProperties;

  return (
    <svg className="progress-circle" viewBox="0 0 120 120" aria-label="">
      <circle className="circle" {...circleDimensions} />
      <circle
        className={'percent-indicator ' + color}
        style={circlePercent}
        {...circleDimensions}
      />
      <text className="percent-text text-bold" x="46" y="-53">
        {`${percent}%`}
      </text>
    </svg>
  );
};

export default ProgressCircle;
