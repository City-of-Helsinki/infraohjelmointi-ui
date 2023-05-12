import { FC, memo } from 'react';
import './styles.css';

interface IPlanningSummaryTableHeadCellProps {
  year: number;
  selectedYear: number | null;
  handleSetSelectedYear: (year: number | null) => void;
  title: string;
}

const PlanningSummaryTableHeadCell: FC<IPlanningSummaryTableHeadCellProps> = ({
  year,
  selectedYear,
  handleSetSelectedYear,
  title,
}) => {
  return (
    <>
      <td data-testid={`head-${year}`}>
        <button onClick={() => handleSetSelectedYear(year)}>
          <span className="text-sm font-light">{title}</span>
          <span className="text-sm font-bold">{`<> ${year}`}</span>
        </button>
      </td>
      {year === selectedYear && (
        <td key={`${year}-monthly-view`} className="!min-w-[500px]">
          <span className="!text-left text-sm font-light">{'Monthly view cell'}</span>
        </td>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableHeadCell);
