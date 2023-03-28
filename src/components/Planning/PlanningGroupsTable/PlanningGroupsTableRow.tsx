import { IProject } from '@/interfaces/projectInterfaces';
import { planProjectValues } from '@/mocks/common';
import { IconDocument, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router';
import ProjectCell from './ProjectCell';
import { IListItem } from '@/interfaces/common';
import { CustomTag } from '@/components/shared';
import useProjectCells from '@/hooks/useProjectCell';

interface IPlanningGroupsTableRowProps {
  project: IProject;
  phases?: Array<IListItem>;
  onProjectMenuClick: (projectId: string, e: MouseEvent) => void;
}

export type ProjectCellGrowDirection = 'left' | 'right';

const PlanningGroupsTableRow: FC<IPlanningGroupsTableRowProps> = ({
  project,
  onProjectMenuClick,
}) => {
  const navigate = useNavigate();
  const navigateToProject = () => navigate(`/project/${project.id}/basics`);

  const projectCells = useProjectCells(project);

  const handleOnProjectMenuClick = useCallback(
    (e: ReactMouseEvent) => onProjectMenuClick(project.id, e as unknown as MouseEvent),
    [onProjectMenuClick, project.id],
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
      {projectCells.map((c) => (
        <ProjectCell key={c.budgetKey} cell={c} />
      ))}
    </tr>
  );
};

export default memo(PlanningGroupsTableRow);
