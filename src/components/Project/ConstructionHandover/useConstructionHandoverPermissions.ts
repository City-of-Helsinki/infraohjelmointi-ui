import { IProject } from '@/interfaces/projectInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import {
  isUserOnlyProjectManager,
  isUserPlanner,
  isUserConstructionManagementLead,
} from '@/utils/userRoleHelpers';

/**
 * Hook to determine the current user's permissions related to the construction handover of a project.
 */
export default function useConstructionHandoverPermissions(project: IProject | undefined) {
  const user = useAppSelector(selectUser);
  const userEmail = user?.email.trim().toLowerCase();

  const isProjectManager = isUserOnlyProjectManager(user);
  const isPlanner = isUserPlanner(user);
  const isConstructionManagementLead = isUserConstructionManagementLead(user);

  const isResponsiblePersonForProject =
    userEmail !== undefined && userEmail === project?.personPlanning?.email.trim().toLowerCase();

  const isConstructionResponsiblePersonForProject =
    userEmail !== undefined &&
    userEmail === project?.personConstruction?.email.trim().toLowerCase();

  return {
    isProjectManager,
    isPlanner,
    isConstructionManagementLead,
    isResponsiblePersonForProject,
    isConstructionResponsiblePersonForProject,
  };
}
