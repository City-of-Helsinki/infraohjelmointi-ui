import { CellType } from '@/interfaces/projectInterfaces';
import { FC, memo, useMemo } from 'react';

interface IMonthlyGraphCellProps {
  index: number;
  planning: { isStart: boolean; percent: string };
  construction: { isStart: boolean; percent: string };
  cellType: CellType;
  month: string;
  id: string;
}

const MonthlyGraphCell: FC<IMonthlyGraphCellProps> = ({
  index,
  planning,
  construction,
  cellType,
  month,
  id,
}) => {
  const cellColor = useMemo(() => (index % 2 == 0 ? 'bg-bus-l' : 'bg-white'), [index]);

  return (
    <td
      className={`monthly-cell project ${cellType} ${cellColor}`}
      data-testid={`project-monthly-graph-cell-${id}-${month}`}
    >
      <div className={`monthly-graph-cell-container ${cellType}`}>
        <>
          {/* Planning bar */}
          <div
            className={`monthly-planning-bar-container ${planning.isStart ? 'justify-end' : ''}`}
          >
            {/* Width of the bar indicates how much of the month is used for planning */}
            <span
              style={{ width: planning.percent }}
              className="monthly-planning-bar"
              data-testid={`monthly-planning-graph-bar-${id}-${month}`}
            />
          </div>
          {/* Construction bar */}
          <div
            className={`monthly-construction-bar-container ${
              construction.isStart ? 'justify-end' : ''
            }`}
          >
            {/* Width of the bar indicates how much of the month is used for construction */}
            <span
              style={{ width: construction.percent }}
              className="monthly-construction-bar"
              data-testid={`monthly-construction-graph-bar-${id}-${month}`}
            />
          </div>
        </>
      </div>
    </td>
  );
};

export default memo(MonthlyGraphCell);
