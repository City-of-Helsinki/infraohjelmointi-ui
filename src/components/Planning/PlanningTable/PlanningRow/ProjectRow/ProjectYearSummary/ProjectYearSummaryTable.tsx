import { CellType } from '@/interfaces/projectInterfaces';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import { IconHammers, IconScrollContent } from 'hds-react/icons';
import { FC, memo, useMemo } from 'react';

interface IProjectYearSummaryTableProps {
  cellType: CellType;
  id: string;
  sapProject: string | undefined;
  sapCosts: Record<string, IProjectSapCost>;
}

const ProjectYearSummaryTable: FC<IProjectYearSummaryTableProps> = ({ cellType, id, sapProject, sapCosts }) => {
  const costs = useMemo(() => {
    const projectCosts = sapCosts[id];

    return {
      projectTaskCosts: Number(projectCosts?.project_task_costs || 1),
      projectTaskCommitments: Number(projectCosts?.project_task_commitments || 2),
      productionTaskCosts: Number(projectCosts?.production_task_costs || 3),
      productionTaskCommitments: Number(projectCosts?.production_task_commitments || 4),
    };
  }, [cellType, id]);
  // All the values in the table are retrieved from SAP and mocked as 0 for now
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
                  <span className="ml-2 text-sm font-medium text-black-60">Toteut.</span>
                </th>
                <th className="w-11">
                  <span className="ml-2 text-sm font-medium text-black-60">Sidot.</span>
                </th>
                <th className="w-11">
                  <span className="ml-2 text-sm font-medium text-black-60">Käytet.</span>
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
                  <span className="text-sm font-light">{costs.projectTaskCosts.toFixed(0)}</span>
                </td>
                <td>
                  <span className="text-sm font-light">{costs.projectTaskCommitments.toFixed(0)}</span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {Number(costs.projectTaskCosts + costs.projectTaskCommitments).toFixed(0)}
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
                  <span className="text-sm font-light">{costs.productionTaskCosts.toFixed(0)}</span>
                </td>
                <td>
                  <span className="text-sm font-light">{costs.productionTaskCommitments.toFixed(0)}</span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {Number(costs.productionTaskCosts + costs.productionTaskCommitments).toFixed(0)}
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
                    {Number(costs.projectTaskCosts + costs.productionTaskCosts).toFixed(0)}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {Number(costs.projectTaskCommitments + costs.productionTaskCommitments).toFixed(0)}
                  </span>
                </td>
                <td>
                  <span className="text-sm font-light">
                    {Number(
                      costs.projectTaskCosts +
                        costs.productionTaskCosts +
                        costs.projectTaskCommitments +
                        costs.productionTaskCommitments,
                    ).toFixed(0)}
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
