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
      {/*
       * planning.isStart is used here because Firefox doesn't support the :has()-selector by default.
       * The :has()-selector logic is already implemented in the styles file for this component,
       * so the isStart logic can be safely removed when Firefox enables the :has()-selector.
       */}
      <div
        className={`monthly-planning-bar-container ${
          planning.percent.startsWith('0') ? 'empty' : ''
        } ${planning.isStart ? '!justify-end' : ''}`}
      >
        <div
          className="monthly-planning-bar"
          style={{ width: planning.percent }}
          data-testid={`monthly-planning-bar-${id}-${month}`}
        />
      </div>
      {/*
       * construction.isStart is used here because Firefox doesn't support the :has()-selector by default.
       * The :has()-selector logic is already implemented in the styles file for this component,
       * so the isStart logic can be safely removed when Firefox enables the :has()-selector.
       */}
      <div
        className={`monthly-construction-bar-container ${
          construction.percent.startsWith('0') ? 'empty' : ''
        } ${construction.isStart ? '!justify-end' : ''}`}
      >
        <div
          className="monthly-construction-bar"
          style={{ width: construction.percent }}
          data-testid={`monthly-construction-bar-${id}-${month}`}
        />
      </div>
    </td>
  );
};

export default memo(MonthlyGraphCell);
