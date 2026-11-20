import { IProject } from '@/interfaces/projectInterfaces';

const useMyWorkloadPlanningLink = (project: IProject | undefined): string | undefined => {
  if (project?.planningPath == null) return;

  const params = new URLSearchParams(project.planningPath);
  params.set('project', project.id);
  return `/planning/?${params.toString()}`;
};

export default useMyWorkloadPlanningLink;
