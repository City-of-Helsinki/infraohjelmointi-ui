import { CellType } from '@/interfaces/projectInterfaces';
import { FC, memo } from 'react';

interface IMonthlyGraphCellProps {
  planning: { isStart: boolean; percent: string };
  construction: { isStart: boolean; percent: string };
  cellType: CellType;
  month: string;
  id: string;
}

const MonthlyGraphCell: FC<IMonthlyGraphCellProps> = ({
  planning,
  construction,
  cellType,
  month,
  id,
}) => {
  return (
    <td
      className={`monthly-cell project ${cellType} `}
      data-testid={`project-monthly-graph-cell-${id}-${month}`}
    >
      <div className={`monthly-graph-cell-container ${cellType}`}>
        {/* Because of the element structure it is impossible to set justify-end using only css, could this be fixed? */}
        <div className={`monthly-planning-bar-container ${planning.isStart ? 'justify-end' : ''}`}>
          {/* Width of the bar indicates how much of the month is used for planning */}
          <span
            style={{ width: planning.percent }}
            className="monthly-planning-bar"
            data-testid={`monthly-planning-graph-bar-${id}-${month}`}
          />
        </div>
        {/* Because of the element structure it is impossible to set justify-end using only css, could this be fixed? */}
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
      </div>
    </td>
  );
};

export default memo(MonthlyGraphCell);
