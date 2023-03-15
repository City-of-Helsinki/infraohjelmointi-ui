import { IProject } from '@/interfaces/projectInterfaces';
import { planProjectValues } from '@/mocks/common';
import { IconDocument, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router';
import ProjectCell, { IProjectCellProps } from './ProjectCell';
import { IListItem } from '@/interfaces/common';
import { CustomTag } from '@/components/shared';
import { isInYearRange } from '@/utils/dates';

const createProjectCells = (project: IProject): Array<IProjectCellProps> => {
  const getCellType = (year: number) => {
    const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd } = project;
    const isPlanning = isInYearRange(year, estPlanningStart, estPlanningEnd);
    const isConstruction = isInYearRange(year, estConstructionStart, estConstructionEnd);

    if (isPlanning && isConstruction) return 'planningAndConstruction';
    if (isPlanning) return 'planning';
    if (isConstruction) return 'construction';
    return 'none';
  };

  const getCells = (value: string, key: string, year: number) => {
    return {
      value,
      cellType: getCellType(year),
      project: project,
      budgetKey: key,
      year: year,
      cellSibling: 'none',
    };
  };

  const cells = [];

  for (const [key, value] of Object.entries(project)) {
    if (key.includes('CurrentYearPlus')) {
      cells.push(getCells(value, key, new Date().getFullYear() + parseInt(key.split('Plus')[1])));
    }
  }

  for (let i = 1; i < cells.length; i++) {
    const curr = cells[i];
    const prev = cells[i - 1];
    const next = cells[i === cells.length - 1 ? i : i + 1];

    if (curr.cellType !== 'none') {
      if (next.cellType === 'none' && prev.cellType === 'none') {
        curr.cellSibling = 'leftAndRight';
      } else if (prev.cellType === 'none') {
        curr.cellSibling = 'right';
      } else if (next.cellType === 'none') {
        curr.cellSibling = 'left';
      }
    }
  }

  return cells as Array<IProjectCellProps>;
};

interface IPlanningGroupsTableRowProps {
  project: IProject;
  phases?: Array<IListItem>;
  onProjectMenuClick: (projectId: string, e: MouseEvent) => void;
}

const PlanningGroupsTableRow: FC<IPlanningGroupsTableRowProps> = ({
  project,
  onProjectMenuClick,
}) => {
  const navigate = useNavigate();
  const navigateToProject = () => navigate(`/project/${project.id}/basics`);
  const projectCells = createProjectCells(project);

  const handleOnProjectMenuClick = useCallback(
    (e: ReactMouseEvent) => onProjectMenuClick(project.id, e as unknown as MouseEvent),
    [project],
  );

  return (
    <tr id={`row-${project.id}`}>
      {/* HEADER */}
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* Left (dots & document) */}
          <div className="project-left-icons-container">
            <IconMenuDots size="xs" className="cursor-pointer" onClick={handleOnProjectMenuClick} />
            <IconDocument />
          </div>
          {/* Center (name button) */}
          <div className="project-name-container">
            <button className="project-name-button" onClick={navigateToProject}>
              {project.name}
            </button>
          </div>
          {/* Right side (category & budget) */}
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
      {projectCells.map((p) => (
        <ProjectCell key={p.budgetKey} {...p} />
      ))}
    </tr>
  );
};

export default memo(PlanningGroupsTableRow);
