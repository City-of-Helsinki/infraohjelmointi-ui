import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { IconDocument, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, MouseEvent as ReactMouseEvent, useRef } from 'react';
import ProjectCell from './ProjectCell';
import { ContextMenuType } from '@/interfaces/common';
import { CustomTag } from '@/components/shared';
import useProjectRow from '@/hooks/useProjectRow';
import useClickOutsideRef from '@/hooks/useClickOutsideRef';
import { dispatchContextMenuEvent } from '@/utils/events';
import { useAppDispatch } from '@/hooks/common';
import { Link } from 'react-router-dom';
import './styles.css';
import { patchProject } from '@/services/projectServices';

interface IProjectRowProps {
  project: IProject;
  onUpdateProject: (projectToUpdate: IProject) => void;
}

const ProjectRow: FC<IProjectRowProps> = ({ project, onUpdateProject }) => {
  const dispatch = useAppDispatch();
  const projectRowRef = useRef<HTMLTableRowElement>(null);
  const {
    cells,
    sums: { costEstimateBudget, availableFrameBudget },
  } = useProjectRow(project);

  const onSubmitPhase = useCallback(
    (req: IProjectRequest) => {
      patchProject({ data: req, id: project.id }).then((res) => onUpdateProject(res));
    },
    [dispatch, project.id],
  );

  // Open the custom context menu for editing the project phase on click
  const handleOpenPhaseMenu = useCallback(
    (e: ReactMouseEvent<SVGElement>) => {
      dispatchContextMenuEvent(e, {
        menuType: ContextMenuType.EDIT_PROJECT_PHASE,
        phaseMenuProps: {
          title: project.name,
          phase: project.phase?.id,
          onSubmitPhase,
        },
      });
    },
    [onSubmitPhase, project.name, project.phase?.id],
  );

  // Remove the active css-class from the current row if the user clicks outside of it
  useClickOutsideRef(
    projectRowRef,
    useCallback(() => {
      if (projectRowRef?.current?.classList.contains('active')) {
        projectRowRef.current.classList.remove('active');
      }
    }, []),
  );

  return (
    <tr id={`project-row-${project.id}`} ref={projectRowRef} data-testid={`row-${project.id}`}>
      {/* HEADER */}
      <th className="project-header-cell" data-testid={`head-${project.id}`}>
        <div className="project-header-cell-container">
          {/* Left (dots & document) */}
          <div className="project-left-icons-container">
            <IconMenuDots
              size="xs"
              className="cursor-pointer"
              data-testid={`edit-phase-${project.id}`}
              onMouseDown={handleOpenPhaseMenu}
            />
            <IconDocument />
            {/* <button className="h-2 w-2 bg-[blue]" onClick={handleOpenPhaseMenu}></button> */}
          </div>
          {/* Center (name button) */}
          <div className="project-name-container">
            <Link
              to={`/project/${project.id}/basics`}
              className="project-name-button"
              data-testid={`navigate-${project.id}`}
            >
              {project.name}
            </Link>
          </div>
          {/* Right side (category & budget) */}
          <div className="project-right-icons-container">
            <div>
              {project.category && (
                <CustomTag
                  text={project.category.value}
                  weight={'light'}
                  id={`category-${project.id}`}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span data-testid={`cost-estimate-budget-${project.id}`}>{costEstimateBudget}</span>
              <span
                className="text-sm font-normal"
                data-testid={`available-frame-budget-${project.id}`}
              >
                {availableFrameBudget}
              </span>
            </div>
          </div>
        </div>
      </th>
      {cells.map((c) => (
        <ProjectCell key={c.financeKey} cell={c} onUpdateProject={onUpdateProject} />
      ))}
    </tr>
  );
};

export default memo(ProjectRow);
