import {
  ConstructionHandoverStatus,
  IConstructionHandover,
} from '@/interfaces/constructionHandoverInterfaces';

const CONSTRUCTION_HANDOVER_STATUS_ORDER: ConstructionHandoverStatus[] = [
  ConstructionHandoverStatus.DRAFT,
  ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER,
  ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
  ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
  ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION,
];

const CONSTRUCTION_HANDOVER_STATUS_LABEL_KEYS: Record<ConstructionHandoverStatus, string> = {
  [ConstructionHandoverStatus.DRAFT]: 'constructionHandoverForm.status.draft',
  [ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER]:
    'constructionHandoverForm.status.submittedToProgrammer',
  [ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION]:
    'constructionHandoverForm.status.submittedToConstruction',
  [ConstructionHandoverStatus.PROJECT_MANAGER_NAMED]:
    'constructionHandoverForm.status.projectManagerNamed',
  [ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION]:
    'constructionHandoverForm.status.movedToConstructionPreparation',
};

export function getPreviousConstructionHandoverStatus(
  status: ConstructionHandoverStatus,
): ConstructionHandoverStatus | null {
  const index = CONSTRUCTION_HANDOVER_STATUS_ORDER.indexOf(status);
  return index > 0 ? CONSTRUCTION_HANDOVER_STATUS_ORDER[index - 1] : null;
}

export function isBackwardConstructionHandoverTransition(
  from: ConstructionHandoverStatus,
  to: ConstructionHandoverStatus,
): boolean {
  return (
    CONSTRUCTION_HANDOVER_STATUS_ORDER.indexOf(to) <
    CONSTRUCTION_HANDOVER_STATUS_ORDER.indexOf(from)
  );
}

export function getConstructionHandoverStatusLabelKey(status: ConstructionHandoverStatus): string {
  return CONSTRUCTION_HANDOVER_STATUS_LABEL_KEYS[status];
}

/**
 * Checks if the construction handover is locked based on its status.
 * Handover is considered locked if its status is one of the following:
 * - SUBMITTED_TO_CONSTRUCTION
 * - PROJECT_MANAGER_NAMED
 * - MOVED_TO_CONSTRUCTION_PREPARATION
 *
 * @param param0 The construction handover object.
 * @returns True if the construction handover is locked, false otherwise.
 */
export function isConstructionHandoverLocked({ status }: IConstructionHandover): boolean {
  return [
    ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
    ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
    ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION,
  ].includes(status);
}

interface IConstructionHandoverEditPermissions {
  isPlanner: boolean;
  isProjectManager: boolean;
  isResponsiblePersonForProject: boolean;
}

/**
 * Checks if the user is allowed to edit the construction handover.
 * - Nobody can edit a locked handover.
 * - Planners can edit in DRAFT and SUBMITTED_TO_PROGRAMMER statuses.
 * - A project manager who is the responsible person for the project can edit only in DRAFT status.
 */
export function canEditConstructionHandover(
  constructionHandover: IConstructionHandover,
  {
    isPlanner,
    isProjectManager,
    isResponsiblePersonForProject,
  }: IConstructionHandoverEditPermissions,
): boolean {
  if (isConstructionHandoverLocked(constructionHandover)) {
    return false;
  }
  if (isPlanner) {
    return true;
  }
  return (
    constructionHandover.status === ConstructionHandoverStatus.DRAFT &&
    isProjectManager &&
    isResponsiblePersonForProject
  );
}
