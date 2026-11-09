import { IClass } from '@/interfaces/classInterfaces';
import { IAdGroup, IUser, UserRole } from '@/interfaces/userInterfaces';

export const isUserAdmin = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.some((ag) => ag.name === UserRole.ADMIN);
};

export const isUserCoordinator = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.some(
    (ag) => ag.name === UserRole.ADMIN || ag.name === UserRole.COORDINATOR,
  );
};

export const isUserPlanner = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.some(
    (ag) =>
      ag.name === UserRole.ADMIN ||
      ag.name === UserRole.COORDINATOR ||
      ag.name === UserRole.PLANNER,
  );
};

export const isUserProjectAreaPlanner = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.some(
    (ag) =>
      ag.name === UserRole.ADMIN ||
      ag.name === UserRole.COORDINATOR ||
      ag.name === UserRole.PLANNER ||
      ag.name === UserRole.PROJECT_AREA_PLANNER,
  );
};

export const isUserProjectManager = (user: IUser | null) => {
  if (!user) {
    return false;
  }

  return user.ad_groups.some(
    (ag) =>
      ag.name === UserRole.ADMIN ||
      ag.name === UserRole.COORDINATOR ||
      ag.name === UserRole.PLANNER ||
      ag.name === UserRole.PROJECT_AREA_PLANNER ||
      ag.name === UserRole.PROJECT_MANAGER,
  );
};

const adGroupIsViewer = (adGroup: IAdGroup) =>
  adGroup.name === UserRole.VIEWER ||
  adGroup.name === UserRole.VIEWER_OTHERS ||
  adGroup.name === UserRole.VIEWER_OUTSIDE_ORGANIZATION ||
  adGroup.name === UserRole.VIEWER_OUTSIDE_ORGANIZATION_ALT;

export const isUserOnlyViewer = (user: IUser | null): boolean => {
  if (!user) {
    return false;
  }

  return !isUserRestrictedProgrammer(user) && user.ad_groups.every(adGroupIsViewer);
};

export const isUserOnlyProjectAreaPlanner = (user: IUser | null) => {
  if (!user) {
    return false;
  }

  return !isUserPlanner(user) && isUserProjectAreaPlanner(user);
};

export const isUserOnlyProjectManager = (user: IUser | null) => {
  if (!user) {
    return false;
  }

  return !isUserProjectAreaPlanner(user) && isUserProjectManager(user);
};

export const isUserConstructionManagementLead = (user: IUser | null) => {
  if (!user) {
    return false;
  }

  return user.ad_groups.some((ag) => ag.name === UserRole.CONSTRUCTION_MANAGEMENT_LEAD);
};

/**
 * Restricted programmers (IO-756) may only edit projects in their assigned classes.
 * The API decides this, so the group name stays configurable there.
 */
export const isUserRestrictedProgrammer = (user: IUser | null) => !!user?.is_restricted_programmer;

/**
 * Ids of the classes a restricted programmer is offered in the class selects (IO-756): the
 * classes they may edit and every class above them, so the assigned class can be reached.
 *
 * The classes above are found by following `parent` ids, not by `path` prefix (IO-961), since
 * `path` can drift from the real hierarchy.
 */
export const getRestrictedVisibleClassIds = (user: IUser | null, allClasses: Array<IClass>) => {
  const parentById = new Map(allClasses.map((c) => [c.id, c.parent]));
  const visible = new Set<string>();

  for (const classId of user?.restricted_class_ids ?? []) {
    let current: string | null | undefined = classId;
    while (current && !visible.has(current)) {
      visible.add(current);
      current = parentById.get(current);
    }
  }

  return visible;
};
