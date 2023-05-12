import { FC, memo } from 'react';
import './styles.css';

interface IPlanningSummaryTableHeadCellProps {
  year: number;
  selectedYear: number | null;
  handleSetSelectedYear: (year: number | null) => void;
  title: string;
}

const months = ['tam', 'hel', 'maa', 'huh', 'tou', 'kes', 'hei', 'elo', 'syy', 'lok', 'mar', 'jou'];

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
        // className="!min-w-[500px]"
        <>
          <td key={`${year}-monthly-view`} className="!min-w-[200px]">
            <span className="!text-center text-sm font-light">{'4.6.2020'}</span>
          </td>
          {months.map((m) => (
            <td key={m} className="!w-[39px] !min-w-[39px] !max-w-[39px] !p-0 !pr-0">
              <span className="!text-center text-sm font-light">{m}</span>
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableHeadCell);
