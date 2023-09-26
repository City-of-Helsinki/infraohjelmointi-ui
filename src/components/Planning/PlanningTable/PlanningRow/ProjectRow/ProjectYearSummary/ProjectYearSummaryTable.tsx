import { CellType } from '@/interfaces/projectInterfaces';
import { IconHammers, IconScrollContent } from 'hds-react/icons';
import { FC, memo } from 'react';

interface IProjectYearSummaryTableProps {
  cellType: CellType;
  id: string;
}

const ProjectYearSummaryTable: FC<IProjectYearSummaryTableProps> = ({ cellType, id }) => {
  // All the values in the table are retrieved from SAP and mocked as 0 for now
  return (
    <td
      className={`monthly-summary-cell project ${cellType}`}
      data-testid={`project-year-summary-${id}`}
    >
      <div className={`monthly-summary-table-container ${cellType}`}>
        {cellType !== 'none' && (
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
                  <span className="text-sm font-light">400</span>
                </td>
                <td>
                  <span className="text-sm font-light">200</span>
                </td>
                <td>
                  <span className="text-sm font-light">600</span>
                </td>
              </tr>
              <tr>
                {/* construction values from SAP */}
                <td className="w-10 text-right">
                  {/* construction icon */}
                  <IconHammers size="xs" />
                </td>
                <td>
                  <span className="text-sm font-light">600</span>
                </td>
                <td>
                  <span className="text-sm font-light">0</span>
                </td>
                <td>
                  <span className="text-sm font-light">600</span>
                </td>
              </tr>
              <tr>
                {/* construction values from SAP */}
                <td className="w-10 text-right">
                  {/* construction icon */}
                  <span className="text-sm">yht.</span>
                </td>
                <td>
                  <span className="text-sm font-light">1000</span>
                </td>
                <td>
                  <span className="text-sm font-light">200</span>
                </td>
                <td>
                  <span className="text-sm font-light">1200</span>
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
