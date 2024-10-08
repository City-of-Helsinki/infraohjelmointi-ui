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

const adGroupIsViewer = (adGroup: IAdGroup) => adGroup.name === UserRole.VIEWER || adGroup.name === UserRole.VIEWER_OTHERS;

export const isUserOnlyViewer = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return (
    (user.ad_groups.length === 1 && adGroupIsViewer(user.ad_groups[0])) ||
    (user.ad_groups.length === 2 && (adGroupIsViewer(user.ad_groups[0]) && adGroupIsViewer(user.ad_groups[1])))
  );
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
