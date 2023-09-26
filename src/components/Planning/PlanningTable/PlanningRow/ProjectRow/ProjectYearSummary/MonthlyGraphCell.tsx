import { CellType, ITimelineDates } from '@/interfaces/projectInterfaces';
import { FC, memo } from 'react';
import { removeHoveredClassFromMonth, setHoveredClassToMonth } from '@/utils/common';
import HoverTooltip from '../../HoverTooltip/HoverTooltip';

interface IMonthlyGraphCellProps {
  planning: { isStart: boolean; percent: string };
  construction: { isStart: boolean; percent: string };
  cellType: CellType;
  month: string;
  id: string;
  timelineDates: ITimelineDates;
}

const MonthlyGraphCell: FC<IMonthlyGraphCellProps> = ({
  planning,
  construction,
  cellType,
  month,
  id,
  timelineDates,
}) => {
  const { planningStart, planningEnd, constructionStart, constructionEnd } = timelineDates;
  const isPercentZero = (percent: string) => percent.startsWith('0');

  return (
    <td
      className={`monthly-cell project ${cellType} hoverable-${month}`}
      data-testid={`project-monthly-graph-cell-${id}-${month}`}
      onMouseOver={() => setHoveredClassToMonth(month)}
      onMouseLeave={() => removeHoveredClassFromMonth(month)}
    >
      {/*
       * planning.isStart is used here because Firefox doesn't support the :has()-selector by default.
       * The :has()-selector logic is already implemented in the styles file for this component,
       * so the isStart logic can be safely removed when Firefox enables the :has()-selector.
       */}
      <div
        className={`monthly-planning-bar-container ${
          isPercentZero(planning.percent) ? 'empty' : ''
        } ${planning.isStart ? '!justify-end' : ''}`}
      >
        {!isPercentZero(planning.percent) && (
          <HoverTooltip text={`${planningStart} - ${planningEnd}`} id={id} />
        )}
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
          isPercentZero(construction.percent) ? 'empty' : ''
        } ${construction.isStart ? '!justify-end' : ''}`}
      >
        {!isPercentZero(construction.percent) && (
          <HoverTooltip text={`${constructionStart} - ${constructionEnd}`} id={id} />
        )}
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
