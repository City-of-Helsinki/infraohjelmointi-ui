import { CustomTag } from '@/components/shared';
import { IProjectSums } from '@/interfaces/common';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { patchProject } from '@/services/projectServices';
import { dispatchContextMenuEvent } from '@/utils/events';
import { useCallback, MouseEvent as ReactMouseEvent, memo, FC } from 'react';
import { Link } from 'react-router-dom';
import {
  IconArrowRightDashed,
  IconClock,
  IconCogwheel,
  IconHammers,
  IconLightbulb,
  IconMenuDots,
  IconPlaybackPause,
  IconQuestionCircle,
  IconScrollContent,
  IconShield,
  IconThumbsUp,
} from 'hds-react/icons';

interface IProjectHeadProps {
  project: IProject;
  sums: IProjectSums;
}

const projectPhaseIcon = {
  proposal: <IconQuestionCircle />,
  design: <IconLightbulb />,
  programmed: <IconCogwheel />,
  draftInitiation: <IconArrowRightDashed />,
  draftApproval: <IconThumbsUp />,
  constructionPlan: <IconScrollContent />,
  constructionWait: <IconPlaybackPause />,
  construction: <IconHammers />,
  warrantyPeriod: <IconClock />,
  completed: <IconShield />,
};

const ProjectHead: FC<IProjectHeadProps> = ({ project, sums }) => {
  const { costEstimateBudget, availableFrameBudget } = sums;

  const projectPhase = project.phase?.value;

  const onSubmitPhase = useCallback(
    (req: IProjectRequest) => {
      patchProject({ data: req, id: project.id }).catch((e) =>
        console.log('Error saving project phase: ', e),
      );
    },
    [project.id],
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
    <th className="project-header-cell" data-testid={`head-${project.id}`}>
      <div className="project-header-cell-container">
        {/* Dots & Document */}
        <div className="project-left-icons-container">
          <IconMenuDots
            size="xs"
            className="cursor-pointer"
            data-testid={`edit-phase-${project.id}`}
            onMouseDown={handleOpenPhaseMenu}
          />
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          {projectPhase && projectPhaseIcon[projectPhase]}
        </div>
        {/* Project name */}
        <div className="project-name-container">
          <Link
            to={`/project/${project.id}/basics`}
            className="project-name-button"
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
