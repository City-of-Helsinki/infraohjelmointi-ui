import { IClass } from '@/interfaces/classInterfaces';
import { PlanningRowType, IPlanningRow } from '@/interfaces/planningInterfaces';
import { IGroup } from '@/interfaces/groupInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { calculatePlanningCells, calculatePlanningRowSums } from './calculations';
import { IProject } from '@/interfaces/projectInterfaces';

// These utils are used by the usePlanningRows and useCoordinationRows

/**
 * Takes a list of groups or projects and returns them sorted by their name
 */
export const sortByName = (list: Array<IProject> | Array<IGroup>) =>
  list.sort((a, b) => a.name.localeCompare(b.name));

/**
 * Filters projects under an IPlanningRow if the correct conditions are met.
 *
 * @param id the id of the current item that the row is being created for
 * @param type IPlanningRowType
 * @param projects projects to map
 * @param districtsForSubClass when the type is a subClassDistrict then we will not render districts under that subClass but would still need the projects that belong to those districts to appear under the subClassDistrict.
 */
export const getSortedProjects = (
  id: string,
  type: PlanningRowType,
  projects: Array<IProject>,
  districtsForSubClass?: Array<IClass>,
) => {
  const getProjectsForClasses = () =>
    projects.filter((p) => !p.projectGroup && !p.projectLocation && p.projectClass === id);

  const getProjectsForSubClassDistrict = () => {
    const projectHasDistrictOrNoLocation = (p: IProject) =>
      districtsForSubClass?.some((d) => d.id === p.projectLocation) || !p.projectLocation;

    return projects.filter(
      (p) => !p.projectGroup && projectHasDistrictOrNoLocation(p) && p.projectClass === id,
    );
  };

  const getProjectsForGroup = () =>
    projects.filter((p) => p.projectGroup).filter((p) => p.projectGroup === id);

  const getProjectsForLocation = () =>
    projects.filter((p) => !p.projectGroup).filter((p) => p.projectLocation === id);

  switch (type) {
    case 'class':
    case 'subClass':
      return sortByName(getProjectsForClasses()) as Array<IProject>;
    case 'subClassDistrict':
      return sortByName(getProjectsForSubClassDistrict()) as Array<IProject>;
    case 'group':
      return sortByName(getProjectsForGroup()) as Array<IProject>;
    case 'district':
    case 'division':
      return sortByName(getProjectsForLocation()) as Array<IProject>;
  }

  return [];
};

/**
 * Builds a PlanningRow object from a class, location or group
 *
 * @param item IClass, ILocation or IGroup (the item that the row will be built for)
 * @param type type of the row (PlanningRowType)
 * @param projects projects to map under the row (they will only be mapped if the correct conditions are met)
 * @param expanded if the row is to be expanded by default
 * @param districtsForSubClass optional districts for the subClass (if a subClass is called 'suurpiiri' then the districts will not be mapped and we use this to gather the projects that would otherwise appear under the districts)
 * @returns IPlanningRow
 */
export const buildPlanningRow = (
  item: IClass | ILocation | IGroup,
  type: PlanningRowType,
  projects: Array<IProject>,
  expanded?: boolean,
  districtsForSubClass?: IClass[],
): IPlanningRow => {
  const projectRows = getSortedProjects(item.id, type, projects, districtsForSubClass);
  const defaultExpanded = expanded || (type === 'division' && projectRows.length > 0);
  const urlSearchParamKey = type === 'districtPreview' ? 'district' : type;
  const nonNavigableTypes = [
    'project',
    'group',
    'division',
    'otherClassificationSubLevel',
    'district',
  ];
  const searchParamOrNull = !nonNavigableTypes.includes(type)
    ? { [urlSearchParamKey]: item.id }
    : null;
  return {
    type: type,
    name: item.name,
    path: type !== 'group' ? (item as IClass | ILocation).path : '',
    id: item.id,
    key: item.id,
    urlSearchParam: searchParamOrNull,
    defaultExpanded,
    children: [],
    projectRows,
    cells: calculatePlanningCells(item.finances, type),
    ...calculatePlanningRowSums(item.finances, type),
  };
};

export const getSelectedOrAll = (
  selected: ILocation | IClass | null,
  all: Array<ILocation | IClass>,
) => (selected ? [selected] : all);
