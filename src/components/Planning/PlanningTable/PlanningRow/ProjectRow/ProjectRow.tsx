import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { planProjectValues } from '@/mocks/common';
import { IconDocument, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, MouseEvent as ReactMouseEvent, useRef } from 'react';
import { useNavigate } from 'react-router';
import ProjectCell from './ProjectCell';
import { ContextMenuType } from '@/interfaces/common';
import { CustomTag } from '@/components/shared';
import useProjectCells from '@/hooks/useProjectCell';
import useClickOutsideRef from '@/hooks/useClickOutsideRef';
import { dispatchContextMenuEvent } from '@/utils/events';
import { useAppDispatch } from '@/hooks/common';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import './styles.css';

interface IProjectRowProps {
  project: IProject;
}

const ProjectRow: FC<IProjectRowProps> = ({ project }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const navigateToProject = () => navigate(`/project/${project.id}/basics`);
  const projectRowRef = useRef<HTMLTableRowElement>(null);
  const projectCells = useProjectCells(project);

  const onSubmitPhase = useCallback(
    (req: IProjectRequest) => {
      dispatch(silentPatchProjectThunk({ data: req, id: project.id }));
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
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* Left (dots & document) */}
          <div className="project-left-icons-container">
            <IconMenuDots size="xs" className="cursor-pointer" onMouseDown={handleOpenPhaseMenu} />
            <IconDocument />
            {/* <button className="h-2 w-2 bg-[blue]" onClick={handleOpenPhaseMenu}></button> */}
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
        <ProjectCell key={c.financeKey} cell={c} />
      ))}
    </tr>
  );
};

export default memo(ProjectRow);
