import { PlanningRowType } from '@/interfaces/common';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

interface IPlanningForecastSums {
  year: number;
  type: PlanningRowType;
  id: string;
}

/** The data displayed here will be provided from SAP */
const PlanningForecastSums: FC<IPlanningForecastSums> = ({ year, type, id }) => {
  const { t } = useTranslation();
  return (
    <td key={`${year}-monthly-cell`} className={`monthly-summary-cell ${type}`}>
      <div
        className={`planning-forecast-sums-container ${type}`}
        data-testid={`planning-forecast-sums-${id}`}
      >
        <div className={`planning-forecast-sums ${type}`}>
          <span className="!text-left">{t('implemented')}</span>
          <span className="!text-left">{t('bound')}</span>
        </div>
        <div className={`planning-forecast-sums ${type}`}>
          <span data-testid={`planning-forecast-implemented-${id}`}>0</span>
          <span data-testid={`planning-forecast-bound-${id}`}>0</span>
        </div>
      </div>
    </td>
  );
};

export default memo(PlanningForecastSums);
