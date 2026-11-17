import { IProject } from '@/interfaces/projectInterfaces';
import { IClassHierarchy, selectBatchedPlanningClasses } from '@/reducers/classSlice';
import { ILocationHierarchy, selectBatchedPlanningLocations } from '@/reducers/locationSlice';
import { selectPlanningGroups } from '@/reducers/groupSlice';
import { useAppSelector } from './common';

const selectClassHierarchy = (
  classId: string | null | undefined,
  planningClasses: IClassHierarchy,
  params: URLSearchParams,
): void => {
  let currentClassId = classId;
  const visitedClasses = new Set<string>();
  while (currentClassId) {
    if (visitedClasses.has(currentClassId)) return;
    visitedClasses.add(currentClassId);
    const masterClass = planningClasses.masterClasses.find(({ id }) => id === currentClassId);
    const projectClass = planningClasses.classes.find(({ id }) => id === currentClassId);
    const subClass = planningClasses.subClasses.find(({ id }) => id === currentClassId);
    if (masterClass) {
      params.set('masterClass', masterClass.id);
    } else if (projectClass) {
      params.set('class', projectClass.id);
    } else if (subClass) {
      params.set('subClass', subClass.id);
    }
    currentClassId = (masterClass ?? projectClass ?? subClass)?.parent;
  }
};

const selectLocationHierarchy = (
  locationId: string | null | undefined,
  locations: ILocationHierarchy,
  params: URLSearchParams,
): void => {
  let currentLocationId = locationId;
  const visitedLocations = new Set<string>();
  while (currentLocationId) {
    if (visitedLocations.has(currentLocationId)) return;
    visitedLocations.add(currentLocationId);
    const location = [
      ...locations.districts,
      ...locations.divisions,
      ...locations.subDivisions,
    ].find(({ id }) => id === currentLocationId);
    if (!location) return;
    if (locations.districts.some(({ id }) => id === location.id)) {
      params.set('district', location.id);
    }
    currentLocationId = location.parent;
  }
};

const useMyWorkloadPlanningLink = (project: IProject | undefined): string | undefined => {
  const planningClasses = useAppSelector(selectBatchedPlanningClasses);
  const locations = useAppSelector(selectBatchedPlanningLocations);
  const groups = useAppSelector(selectPlanningGroups);
  if (!project) return;

  const group = groups.find(({ id }) => id === project.projectGroup);
  const params = new URLSearchParams();
  selectClassHierarchy(group?.classRelation ?? project.projectClass, planningClasses, params);
  selectLocationHierarchy(group?.locationRelation ?? project.projectLocation, locations, params);
  params.set('project', project.id);
  return `/planning/?${params.toString()}`;
};

export default useMyWorkloadPlanningLink;
