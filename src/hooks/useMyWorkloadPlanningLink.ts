import { useEffect, useMemo, useState } from 'react';
import { IProject } from '@/interfaces/projectInterfaces';
import { IPlanningRow, IPlanningRowSelections } from '@/interfaces/planningInterfaces';
import { IClassHierarchy, selectBatchedPlanningClasses } from '@/reducers/classSlice';
import { ILocationHierarchy, selectBatchedPlanningLocations } from '@/reducers/locationSlice';
import { IGroup } from '@/interfaces/groupInterfaces';
import { selectPlanningGroups } from '@/reducers/groupSlice';
import { selectStartYear } from '@/reducers/planningSlice';
import { buildPlanningTableRows } from './usePlanningRows';
import { getSelectedOrAll, getTypeAndIdForLowestExpandedRow } from '@/utils/planningRowUtils';
import { getProjectsWithParams } from '@/services/projectServices';
import { useAppSelector } from './common';

const containsProject = (rows: IPlanningRow[], projectId: string): boolean =>
  rows.some(
    (row) =>
      row.projectRows.some((project) => project.id === projectId) ||
      containsProject(row.children, projectId),
  );

const selectClassHierarchy = (
  classId: string | null | undefined,
  planningClasses: IClassHierarchy,
  selections: IPlanningRowSelections,
  params: URLSearchParams,
): boolean => {
  let currentClassId = classId;
  const visitedClasses = new Set<string>();
  while (currentClassId) {
    if (visitedClasses.has(currentClassId)) return false;
    visitedClasses.add(currentClassId);
    const masterClass = planningClasses.masterClasses.find(({ id }) => id === currentClassId);
    const projectClass = planningClasses.classes.find(({ id }) => id === currentClassId);
    const subClass = planningClasses.subClasses.find(({ id }) => id === currentClassId);
    if (masterClass) {
      selections.selectedMasterClass = masterClass;
      params.set('masterClass', masterClass.id);
    } else if (projectClass) {
      selections.selectedClass = projectClass;
      params.set('class', projectClass.id);
    } else if (subClass) {
      selections.selectedSubClass = subClass;
      params.set('subClass', subClass.id);
    } else {
      return false;
    }
    currentClassId = (masterClass ?? projectClass ?? subClass)?.parent;
  }
  return true;
};

const selectLocationHierarchy = (
  locationId: string | null | undefined,
  locations: ILocationHierarchy,
  selections: IPlanningRowSelections,
  params: URLSearchParams,
): boolean => {
  let currentLocationId = locationId;
  const visitedLocations = new Set<string>();
  while (currentLocationId) {
    if (visitedLocations.has(currentLocationId)) return false;
    visitedLocations.add(currentLocationId);
    const location = [
      ...locations.districts,
      ...locations.divisions,
      ...locations.subDivisions,
    ].find(({ id }) => id === currentLocationId);
    if (!location) return false;
    if (locations.districts.some(({ id }) => id === location.id)) {
      selections.selectedDistrict = location;
      params.set('district', location.id);
    }
    currentLocationId = location.parent;
  }
  return true;
};

const getPlanningTarget = (
  project: IProject | undefined,
  isLoading: boolean,
  planningClasses: IClassHierarchy,
  locations: ILocationHierarchy,
  groups: IGroup[],
  year: number,
) => {
  if (isLoading) return { reason: 'planningLinkLoading' };
  if (!project) return { reason: 'planningLinkProjectUnavailable' };
  if (!project.programmed) return { reason: 'planningLinkNotProgrammed' };

  const group = groups.find(({ id }) => id === project.projectGroup);
  if (project.projectGroup && !group) return { reason: 'planningLinkHierarchyUnavailable' };

  const classId = group?.classRelation ?? project.projectClass;
  const locationId = group?.locationRelation ?? project.projectLocation;
  const params = new URLSearchParams();
  const selections: IPlanningRowSelections = {
    selectedMasterClass: null,
    selectedClass: null,
    selectedSubClass: null,
    selectedDistrict: null,
    selectedCollectiveSubLevel: null,
    selectedSubLevelDistrict: null,
    selectedOtherClassification: null,
  };
  if (!selectClassHierarchy(classId, planningClasses, selections, params))
    return { reason: 'planningLinkHierarchyUnavailable' };

  if (!selectLocationHierarchy(locationId, locations, selections, params))
    return { reason: 'planningLinkHierarchyUnavailable' };

  const { type, id } = getTypeAndIdForLowestExpandedRow(selections);
  if (!type || !id || params.get(type) !== id)
    return { reason: 'planningLinkHierarchyUnavailable' };
  const list = {
    masterClasses: getSelectedOrAll(selections.selectedMasterClass, planningClasses.masterClasses),
    classes: getSelectedOrAll(selections.selectedClass, planningClasses.classes),
    subClasses: getSelectedOrAll(selections.selectedSubClass, planningClasses.subClasses),
    districts: selections.selectedDistrict ? [selections.selectedDistrict] : locations.districts,
    divisions: locations.divisions,
    groups,
    collectiveSubLevels: [],
    otherClassifications: planningClasses.otherClassifications,
    otherClassificationSubLevels: [],
  };
  const canRender = (projects: IProject[]) =>
    containsProject(
      buildPlanningTableRows(list, projects, selections, locations.subDivisions),
      project.id,
    );
  if (!canRender([project])) return { reason: 'planningLinkHierarchyUnavailable' };
  params.set('project', project.id);
  return { url: `/planning/?${params.toString()}`, type, id, year, canRender };
};

const useMyWorkloadPlanningLink = (
  project: IProject | undefined,
  isLoading: boolean,
  isOpen: boolean,
) => {
  const planningClasses = useAppSelector(selectBatchedPlanningClasses);
  const locations = useAppSelector(selectBatchedPlanningLocations);
  const groups = useAppSelector(selectPlanningGroups);
  const year = useAppSelector(selectStartYear);
  const target = useMemo(
    () => getPlanningTarget(project, isLoading, planningClasses, locations, groups, year),
    [project, isLoading, planningClasses, locations, groups, year],
  );

  const [checked, setChecked] = useState<{ target: typeof target; reason?: string } | null>(null);
  useEffect(() => {
    if (!isOpen || !target.url) return;
    const controller = new AbortController();
    getProjectsWithParams(
      {
        params: `${target.type}=${target.id}`,
        programmed: true,
        forcedToFrame: false,
        direct: false,
        year,
      },
      false,
      { signal: controller.signal },
    ).then(
      ({ results }) => {
        if (!controller.signal.aborted) {
          setChecked({
            target,
            reason: target.canRender(results) ? undefined : 'planningLinkNotVisible',
          });
        }
      },
      () => {
        if (!controller.signal.aborted) setChecked({ target, reason: 'planningLinkCheckFailed' });
      },
    );
    return () => controller.abort();
  }, [isOpen, target, year]);

  const reason =
    target.reason ?? (checked?.target === target ? checked.reason : 'planningLinkLoading');
  return { url: isOpen && !reason ? target.url : undefined, reason, year };
};

export default useMyWorkloadPlanningLink;
