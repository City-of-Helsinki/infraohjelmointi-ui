import { CustomTag } from '@/components/shared';
import { IProjectSums } from '@/interfaces/planningInterfaces';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { patchProject } from '@/services/projectServices';
import { dispatchContextMenuEvent } from '@/utils/events';
import { useCallback, MouseEvent as ReactMouseEvent, memo, FC } from 'react';
import { Link } from 'react-router-dom';
import { IconMenuDots, IconSize } from 'hds-react/icons';
import optionIcon from '@/utils/optionIcon';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { notifyError } from '@/reducers/notificationSlice';
import { isUserOnlyViewer } from '@/utils/userRoleHelpers';
import { selectUser } from '@/reducers/authSlice';
import { useOptions } from '@/hooks/useOptions';
import { useProjectPhaseValidation } from '@/hooks/useProjectValidation';
import { Trans, useTranslation } from 'react-i18next';
import { useHoverTooltip } from '../HoverTooltip/useHoverTooltip';

const PRIORITY_VALUE_MAP: Record<string, string> = {
  high: '1',
  medium: '2',
  low: '3',
};

const PRIORITY_BG_COLOR_MAP: Record<string, string> = {
  high: 'var(--color-brick)',
  medium: 'var(--color-success)',
  low: 'var(--color-black-20)',
};

const PRIORITY_TEXT_COLOR_MAP: Record<string, string> = {
  high: 'var(--color-white)',
  medium: 'var(--color-white)',
  low: 'var(--color-black-90)',
};

interface IProjectHeadProps {
  project: IProject;
  sums: IProjectSums;
}

const ProjectHead: FC<IProjectHeadProps> = ({ project, sums }) => {
  const { t } = useTranslation();
  const { costEstimateBudget, availableFrameBudget } = sums;
  const user = useAppSelector(selectUser);
  const phases = useOptions('phases');
  const dispatch = useAppDispatch();
  const { showTooltip, hideTooltip } = useHoverTooltip();
  const isPhaseValid = useProjectPhaseValidation({
    getProject: () => project,
  });
  const projectPhase = project.phase?.value;
  const priorityTagText = project.priority?.value
    ? PRIORITY_VALUE_MAP[project.priority.value.toLowerCase()] ?? project.priority.value
    : undefined;
  const priorityBgColor = project.priority?.value
    ? PRIORITY_BG_COLOR_MAP[project.priority.value.toLowerCase()]
    : undefined;
  const priorityTextColor = project.priority?.value
    ? PRIORITY_TEXT_COLOR_MAP[project.priority.value.toLowerCase()]
    : undefined;
  const priorityTooltipTextKey = project.priority?.value;

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
    (e: ReactMouseEvent<HTMLButtonElement>) => {
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

  const showPriorityTooltip = useCallback(
    (e: React.SyntheticEvent<HTMLElement>) =>
      showTooltip(e, t(`tooltips.priority.${priorityTooltipTextKey?.toLowerCase()}`)),
    [priorityTooltipTextKey, showTooltip, t],
  );

  const showProjectBudgetTooltip = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement>) =>
      showTooltip(e, <Trans i18nKey={'tooltips.totalBudgets.project'} />),
    [showTooltip],
  );

  return (
    <th className="project-head-cell" data-testid={`head-${project.id}`}>
      <div className="project-head-cell-container">
        {/* Dots & Document */}
        <div className="project-left-icons-container">
          <button
            className={isUserOnlyViewer(user) ? 'pointer-events-none' : 'cursor-pointer'}
            data-testid={`edit-phase-${project.id}`}
            onClick={handleOpenPhaseMenu}
          >
            <IconMenuDots size={IconSize.ExtraSmall} />
          </button>
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
          {project.priority && priorityTagText && (
            <div
              onMouseEnter={showPriorityTooltip}
              onMouseLeave={hideTooltip}
              onFocus={showPriorityTooltip}
              onBlur={hideTooltip}
            >
              <CustomTag
                text={priorityTagText}
                color={priorityBgColor}
                textColor={priorityTextColor}
                weight={'light'}
                id={`priority-${project.id}`}
                circular
              />
            </div>
          )}
          <div>
            {project.category && (
              <CustomTag
                text={project.category.value}
                weight={'light'}
                id={`category-${project.id}`}
              />
            )}
          </div>
          <div
            className="flex flex-col"
            onMouseEnter={showProjectBudgetTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showProjectBudgetTooltip}
            onBlur={hideTooltip}
          >
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
