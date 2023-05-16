import { CellType, IMonthlyData } from '@/interfaces/projectInterfaces';
import { FC, memo, useMemo } from 'react';
import ProjectYearSummaryTable from './ProjectYearSummaryTable';
import './styles.css';
import MonthlyGraphCell from './MonthlyGraphCell';

interface IProjectYearSummaryProps {
  startYear: number;
  year: number;
  monthlyDataList: Array<IMonthlyData>;
  cellType: CellType;
}

const ProjectYearSummary: FC<IProjectYearSummaryProps> = ({
  startYear,
  year,
  monthlyDataList,
  cellType,
}) => {
  const showYearSummaryTable = useMemo(() => startYear === year, [startYear, year]);

  return (
    <>
      {/* Year summary (only visible for the first year in the table) */}
      {showYearSummaryTable && <ProjectYearSummaryTable cellType={cellType} />}
      {/* Monthly graph */}
      {monthlyDataList.map((c, i) => (
        <MonthlyGraphCell key={c.month} index={i} {...c} cellType={cellType} />
      ))}
    </>
  );
};

export default memo(ProjectYearSummary);
