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

const adGroupIsViewer = (adGroup: IAdGroup) => adGroup.name === UserRole.VIEWER || adGroup.name === UserRole.VIEWER_OTHERS || adGroup.name === UserRole.VIEWER_OUTSIDE_ORGANIZATION;

export const isUserOnlyViewer = (user: IUser | null): boolean => {
  if (!user) {
    return false;
  }

  return user.ad_groups.every(adGroupIsViewer);
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
