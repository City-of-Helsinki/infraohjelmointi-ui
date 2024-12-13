import { CellType } from '@/interfaces/projectInterfaces';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import { IconHammers, IconScrollContent } from 'hds-react/icons';
import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface IProjectYearSummaryTableProps {
  cellType: CellType;
  id: string;
  sapProject: string | undefined;
  sapCosts: Record<string, IProjectSapCost>;
  sapCurrentYear: Record<string, IProjectSapCost>;
}

const ProjectYearSummaryTable: FC<IProjectYearSummaryTableProps> = ({
  cellType,
  id,
  sapProject,
  sapCurrentYear
}) => {
  const { t } = useTranslation();

  const costs = useMemo(() => {
    //For planning view use sap values from the current year
    const projectCosts = sapCurrentYear[id];

    return {
      projectTaskCosts: Number(projectCosts?.project_task_costs || 0),
      projectTaskCommitments: Number(projectCosts?.project_task_commitments || 0),
      productionTaskCosts: Number(projectCosts?.production_task_costs || 0),
      productionTaskCommitments: Number(projectCosts?.production_task_commitments || 0),
    };
  }, [cellType, id]);

  // Format the numbers to be displayed in the table, e.g. 1 000000 and rounded to closest 1 000
  const formatSapNumbers = (number: number) => {
    // Convert to kiloeuros and round to the nearest thousand
    const kiloeuros = Math.round(number / 1000);
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(kiloeuros);
  };
  return (
    <td
      className={`monthly-summary-cell project ${cellType}`}
      data-testid={`project-year-summary-${id}`}
    >
      <div className={`monthly-summary-table-container ${cellType}`}>
        {/* We want to display this information only when the project has a SAP id */}
        {sapProject && (
          <table className="text-right">
            <thead>
              <tr>
                <th></th>
                <th className="w-11">
                  <span className="ml-2 text-sm font-medium text-black-60">{t('monthlySummaryTable.currentYearSapCosts')}</span>
                </th>
                <th className="w-11">
                  <span className="ml-2 text-sm font-medium text-black-60">{t('monthlySummaryTable.currentYearSapCommitments')}</span>
                </th>
                <th className="w-11">
                  <span className="ml-2 text-sm font-medium text-black-60">{t('monthlySummaryTable.currentYearTotalSapValues')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* planning values from SAP */}
              <tr>
                <td className="w-10 text-right">
                  {/* planning icon */}
                  <IconScrollContent size="xs" />
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(costs.projectTaskCosts)}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(costs.projectTaskCommitments)}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(
                      Number(costs.projectTaskCosts + costs.projectTaskCommitments),
                    )}
                  </span>
                </td>
              </tr>
              <tr>
                {/* construction values from SAP */}
                <td className="w-10 text-right">
                  {/* construction icon */}
                  <IconHammers size="xs" />
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(costs.productionTaskCosts)}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(costs.productionTaskCommitments)}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(
                      Number(costs.productionTaskCosts + costs.productionTaskCommitments),
                    )}
                  </span>
                </td>
              </tr>
              <tr>
                {/* construction values from SAP */}
                <td className="w-10 text-right">
                  {/* construction icon */}
                  <span className="text-sm">yht.</span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(Number(costs.projectTaskCosts + costs.productionTaskCosts))}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(
                      Number(costs.projectTaskCommitments + costs.productionTaskCommitments),
                    )}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {formatSapNumbers(
                      Number(
                        costs.projectTaskCosts +
                          costs.productionTaskCosts +
                          costs.projectTaskCommitments +
                          costs.productionTaskCommitments,
                      ),
                    )}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </td>
  );
};

export default memo(ProjectYearSummaryTable);
