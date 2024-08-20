import { CustomTag } from '@/components/shared';
import { IProjectSums } from '@/interfaces/planningInterfaces';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { patchProject } from '@/services/projectServices';
import { dispatchContextMenuEvent } from '@/utils/events';
import { useCallback, MouseEvent as ReactMouseEvent, memo, FC } from 'react';
import { Link } from 'react-router-dom';
import { IconMenuDots } from 'hds-react/icons';
import optionIcon from '@/utils/optionIcon';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { notifyError } from '@/reducers/notificationSlice';
import { isUserOnlyViewer } from '@/utils/userRoleHelpers';
import { selectUser } from '@/reducers/authSlice';
import { useOptions } from '@/hooks/useOptions';
import { useProjectPhaseValidation } from '@/hooks/useProjectValidation';

interface IProjectHeadProps {
  project: IProject;
  sums: IProjectSums;
}

const ProjectHead: FC<IProjectHeadProps> = ({ project, sums }) => {
  const { costEstimateBudget, availableFrameBudget } = sums;
  const user = useAppSelector(selectUser);
  const phases = useOptions('phases');
  const dispatch = useAppDispatch();
  const isPhaseValid = useProjectPhaseValidation({
    getProject: () => project,
  });
  const projectPhase = project.phase?.value;

  const onSubmitPhase = useCallback(
    (req: IProjectRequest) => {
      const phase = phases.find((p) => p.value === req.phase);
      if (phase) {
        const isValid = isPhaseValid(phase);
        if (!isValid) {
          dispatch(notifyError({ message: 'phaseChangeError', title: 'patchError' }));
          return;
        }
      }
      patchProject({ data: req, id: project.id }).catch(() =>
        dispatch(notifyError({ message: 'phaseChangeError', title: 'patchError' })),
      );
    },
    [dispatch, isPhaseValid, phases, project.id],
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

  return (
    <th className="project-head-cell" data-testid={`head-${project.id}`}>
      <div className="project-head-cell-container">
        {/* Dots & Document */}
        <div className="project-left-icons-container">
          <IconMenuDots
            size="xs"
            className={isUserOnlyViewer(user) ? 'pointer-events-none' : 'cursor-pointer'}
            data-testid={`edit-phase-${project.id}`}
            onMouseDown={handleOpenPhaseMenu}
          />
          {projectPhase && optionIcon[projectPhase as keyof typeof optionIcon]}
        </div>
        {/* Project name */}
        <div className="project-name-container">
          <Link
            to={`/project/${project.id}/basics`}
            className={`project-name-button`}
            data-testid={`navigate-${project.id}`}
          >
            {project.name}
          </Link>
        </div>
        {/* Category & Budgets */}
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
            <span data-testid={`available-frame-budget-${project.id}`}>{availableFrameBudget}</span>
            <span
              className="text-sm font-normal"
              data-testid={`cost-estimate-budget-${project.id}`}
            >
              {costEstimateBudget}
            </span>
          </div>
        </div>
      </div>
    </th>
  );
};

export default memo(ProjectHead);
