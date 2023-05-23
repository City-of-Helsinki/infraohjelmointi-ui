import { CellType, IMonthlyData } from '@/interfaces/projectInterfaces';
import { FC, memo, useMemo } from 'react';
import ProjectYearSummaryTable from './ProjectYearSummaryTable';
import MonthlyGraphCell from './MonthlyGraphCell';
import './styles.css';

interface IProjectYearSummaryProps {
  id: string;
  startYear: number;
  year: number;
  monthlyDataList: Array<IMonthlyData>;
  cellType: CellType;
}

const ProjectYearSummary: FC<IProjectYearSummaryProps> = ({
  id,
  startYear,
  year,
  monthlyDataList,
  cellType,
}) => {
  const showYearSummaryTable = useMemo(() => startYear === year, [startYear, year]);

  return (
    <>
      {/* Year summary (only visible for the first year in the table) */}
      {showYearSummaryTable && <ProjectYearSummaryTable cellType={cellType} id={id} />}
      {/* Monthly graph */}
      {monthlyDataList.map((c, i) => (
        <MonthlyGraphCell
          key={c.month}
          index={i}
          {...c}
          cellType={cellType}
          month={c.month}
          id={id}
        />
      ))}
    </>
  );
};

export default memo(ProjectYearSummary);
