import { IUser, UserRole } from '@/interfaces/userInterfaces';

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
  return user.ad_groups.some((ag) => ag.name === UserRole.COORDINATOR);
};

export const isUserPlanner = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.some((ag) => ag.name === UserRole.PLANNER);
};

export const isUserProjectManager = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.some((ag) => ag.name === UserRole.PROJECT_MANAGER);
};

export const isUserProjectAreaPlanner = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.some((ag) => ag.name === UserRole.PROJECT_AREA_PLANNER);
};

export const isUserOnlyViewer = (user: IUser | null) => {
  if (!user) {
    return false;
  }
  return user.ad_groups.length === 1 && user.ad_groups.some((ag) => ag.name === UserRole.VIEWER);
};
