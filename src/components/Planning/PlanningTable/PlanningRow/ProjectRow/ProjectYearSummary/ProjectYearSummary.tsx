import { CellType, IMonthlyData, ITimelineDates } from '@/interfaces/projectInterfaces';
import { FC, memo, useMemo } from 'react';
import ProjectYearSummaryTable from './ProjectYearSummaryTable';
import MonthlyGraphCell from './MonthlyGraphCell';
import './styles.css';
import { getProjectSapCurrentYearByYear } from '@/reducers/sapCostSlice';
import { useAppSelector } from '@/hooks/common';

interface IProjectYearSummaryProps {
  id: string;
  startYear: number;
  year: number;
  monthlyDataList: Array<IMonthlyData>;
  cellType: CellType;
  timelineDates: ITimelineDates;
  sapProject: string | undefined;
}

const ProjectYearSummary: FC<IProjectYearSummaryProps> = (props) => {
  const { year, monthlyDataList } = props;
  const projectSapValuesByYear = useAppSelector(getProjectSapCurrentYearByYear);
  const sapCurrentYear = projectSapValuesByYear[props.year] ?? {};
  const currentYear = new Date().getFullYear();
  const showYearSummaryTable = useMemo(() => year <= currentYear, [year, currentYear]);

  return (
    <>
      {/* Year summary (only visible for the current and past years in the table) */}
      {showYearSummaryTable && (
        <ProjectYearSummaryTable {...props} sapCurrentYear={sapCurrentYear} />
      )}
      {/* Monthly graph */}
      {monthlyDataList.map((c) => (
        <MonthlyGraphCell key={c.month} {...c} month={c.month} {...props} />
      ))}
    </>
  );
};

export default memo(ProjectYearSummary);
