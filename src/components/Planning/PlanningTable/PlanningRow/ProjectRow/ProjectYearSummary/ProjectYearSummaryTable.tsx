import { CellType } from '@/interfaces/projectInterfaces';
import { IconTicket } from 'hds-react/icons';
import { memo } from 'react';

const ProjectYearSummaryTable = ({ cellType }: { cellType: CellType }) => {
  // All the values in the table are retrieved from SAP and mocked as 0 for now
  return (
    <td className={`monthly-summary-cell project ${cellType}`}>
      <div className={`monthly-summary-table-container ${cellType}`}>
        {cellType !== 'none' && (
          <table className="gap-2 text-right">
            <thead>
              <tr>
                <th></th>
                <th className="w-14">
                  <span className="text-sm font-medium text-black-60">Toteut.</span>
                </th>
                <th className="w-14">
                  <span className="text-sm font-medium text-black-60">Sidot.</span>
                </th>
                <th className="w-14">
                  <span className="text-sm font-medium text-black-60">Lisät.</span>
                </th>
                <th className="w-14">
                  <span className="text-sm font-medium text-black-60">Viiväst.</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* TODO: planning values from SAP */}
              <tr>
                <td className="w-10 text-right">
                  {/* TODO: planning icon */}
                  <IconTicket size="xs" />
                </td>
                <td>
                  <span className="text-sm font-light">0</span>
                </td>
                <td>
                  <span className="text-sm font-light">0</span>
                </td>
                <td>
                  <span className="text-sm font-light">0</span>
                </td>
                <td>
                  <span className="text-sm font-light">0/0</span>
                </td>
              </tr>
              <tr>
                {/* TODO: construction values from SAP */}
                <td className="w-10 text-right">
                  {/* TODO: construction icon */}
                  <IconTicket size="xs" />
                </td>
                <td>
                  <span className="text-sm font-light">0</span>
                </td>
                <td>
                  <span className="text-sm font-light">0</span>
                </td>
                <td>
                  <span className="text-sm font-light">0</span>
                </td>
                <td>
                  <span className="text-sm font-light">0/0</span>
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
