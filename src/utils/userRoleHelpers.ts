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
 * True if the class path is one of the restricted programmer's assigned classes or below one.
 */
export const isClassPathInRestrictedScope = (user: IUser | null, classPath?: string | null) => {
  if (!classPath) {
    return false;
  }

  return (user?.restricted_class_paths ?? []).some(
    (path) => classPath === path || classPath.startsWith(`${path}/`),
  );
};

/**
 * True if the class path is in scope or is a parent of an assigned class, so it has to be
 * selectable to reach the assigned class in the class selects.
 */
export const isClassPathOnRestrictedScopePath = (user: IUser | null, classPath?: string | null) => {
  if (!classPath) {
    return false;
  }

  return (
    isClassPathInRestrictedScope(user, classPath) ||
    (user?.restricted_class_paths ?? []).some((path) => path.startsWith(`${classPath}/`))
  );
};
