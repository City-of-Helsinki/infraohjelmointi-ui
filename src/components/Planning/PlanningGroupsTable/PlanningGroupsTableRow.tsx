import { IProject } from '@/interfaces/projectInterfaces';
import { planProjectValues } from '@/mocks/common';
import { IconDocument, IconMenuDots } from 'hds-react/icons';
import { FC, memo } from 'react';
import { useNavigate } from 'react-router';
import ProjectCell, { IProjectCellProps } from './ProjectCell';

import { IListItem } from '@/interfaces/common';
import { CustomTag } from '@/components/shared';

/**
 * RED CELLS
 * background: 'var(--color-suomenlinna-light)'
 * borderBottom: '4px solid var(--color-suomenlinna)'
 *
 * GREEN CELLS
 * ?
 *
 * BLUE CELLS
 * ?
 */

// switch (key) {
//   case 'budgetProposalCurrentYearPlus1':
//     columns.push(getColumn(value, key, new Date().getFullYear()));
//     break;
//   case 'budgetProposalCurrentYearPlus2':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 1));
//     break;
//   case 'preliminaryCurrentYearPlus3':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 2));
//     break;
//   case 'preliminaryCurrentYearPlus4':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 3));
//     break;
//   case 'preliminaryCurrentYearPlus5':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 4));
//     break;
//   case 'preliminaryCurrentYearPlus6':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 5));
//     break;
//   case 'preliminaryCurrentYearPlus7':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 6));
//     break;
//   case 'preliminaryCurrentYearPlus8':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 7));
//     break;
//   case 'preliminaryCurrentYearPlus9':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 8));
//     break;
//   case 'preliminaryCurrentYearPlus10':
//     columns.push(getColumn(value, key, new Date().getFullYear() + 9));
//     break;
//   default:
//     break;

//   /*
//   budgetProposalCurrentYearPlus1,
//   budgetProposalCurrentYearPlus2,
//   preliminaryCurrentYearPlus3,
//   preliminaryCurrentYearPlus4,
//   preliminaryCurrentYearPlus5,
//   preliminaryCurrentYearPlus6,
//   preliminaryCurrentYearPlus7,
//   preliminaryCurrentYearPlus8,
//   preliminaryCurrentYearPlus9,
//   preliminaryCurrentYearPlus10,
//   */
// }

interface IPlanningProjectsTableProps {
  project: IProject;
  phases?: Array<IListItem>;
  onProjectMenuClick: (projectId: string, elementPosition: MouseEvent) => void;
}

const isYearBetween = (
  year: number,
  startDate: string | undefined,
  endDate: string | undefined,
): boolean => {
  const startYear = parseInt(startDate?.split('.').pop() || '0');
  const endYear = parseInt(endDate?.split('.').pop() || '0');

  return startYear && endYear ? year >= startYear && year <= endYear : false;
};

const createProjectCells = (project: IProject): Array<IProjectCellProps> => {
  const cells = [];

  const getCells = (value: string, key: string, year: number) => {
    const cell = {} as IProjectCellProps;
    cell.value = value;
    cell.isPlanning = isYearBetween(year, project.estPlanningStart, project.estPlanningEnd);
    cell.isConstruction = isYearBetween(
      year,
      project.estConstructionStart,
      project.estConstructionEnd,
    );
    cell.objectKey = key;
    cell.id = project.id;
    return cell;
  };

  for (const [key, value] of Object.entries(project)) {
    if (key.includes('budgetProposalCurrentYearPlus')) {
      const keyValue = parseInt(key.split('budgetProposalCurrentYearPlus')[1]);
      cells.push(getCells(value, key, new Date().getFullYear() + keyValue));
    }
    if (key.includes('preliminaryCurrentYearPlus')) {
      const keyValue = parseInt(key.split('preliminaryCurrentYearPlus')[1]);
      cells.push(getCells(value, key, new Date().getFullYear() + keyValue));
    }
  }
  return cells;
};

/**
 * We're only mapping the project name here for now since the values aren't yet implemented
 */
const PlanningGroupsTableRow: FC<IPlanningProjectsTableProps> = ({
  project,
  onProjectMenuClick,
}) => {
  const navigate = useNavigate();
  const navigateToProject = () => navigate(`/project/${project.id}/basics`);

  const projectCells = createProjectCells(project);

  return (
    <tr>
      {/* HEADER */}
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* Left (dots & document) */}
          <div className="project-left-icons-container">
            <IconMenuDots
              size="xs"
              className="dots-icon"
              onClick={(e) => onProjectMenuClick(project.id, e as unknown as MouseEvent)}
            />
            <IconDocument />
          </div>
          {/* Center (name button) */}
          <div className="project-name-container">
            <button className="project-name-button" onClick={navigateToProject}>
              {project.name}
            </button>
          </div>
          {/* Right side (category & sum) */}
          <div className="project-right-icons-container">
            <div>
              {project.category && <CustomTag text={project.category.value} weight={'light'} />}
            </div>
            <div className="flex flex-col">
              <span>{planProjectValues.value1}</span>
              <span className="text-sm font-normal">{planProjectValues.value2}</span>
            </div>
          </div>
        </div>
      </th>
      {projectCells.map((p, i) => (
        <ProjectCell key={i} {...p} />
      ))}
    </tr>
  );
};

export default memo(PlanningGroupsTableRow);
