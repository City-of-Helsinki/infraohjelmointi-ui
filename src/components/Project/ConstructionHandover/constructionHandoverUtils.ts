import {
  ConstructionHandoverStatus,
  IConstructionHandover,
} from '@/interfaces/constructionHandoverInterfaces';

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
