import { CellType, IMonthlyData, ITimelineDates } from '@/interfaces/projectInterfaces';
import { FC, memo, useMemo } from 'react';
import ProjectYearSummaryTable from './ProjectYearSummaryTable';
import MonthlyGraphCell from './MonthlyGraphCell';
import './styles.css';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

interface IProjectYearSummaryProps {
  id: string;
  startYear: number;
  year: number;
  monthlyDataList: Array<IMonthlyData>;
  cellType: CellType;
  timelineDates: ITimelineDates;
  sapProject: string | undefined;
  sapCurrentYear: Record<string, IProjectSapCost>;
}

const ProjectYearSummary: FC<IProjectYearSummaryProps> = (props) => {
  const { year, monthlyDataList, sapCurrentYear } = props;
  const currentYear = new Date().getFullYear();
  const showYearSummaryTable = useMemo(() => year === currentYear, [year, currentYear]);

  return (
    <>
      {/* Year summary (only visible for the first year in the table) */}
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
