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
 * Filters and sorts projects for a class, location or group alphabetically for a given row type.
 */
export const getSortedProjects = (
  id: string,
  type: PlanningRowType,
  projects: Array<IProject>,
  name: string,
) => {
  let projectList: Array<IProject> = [];
  switch (type) {
    case 'class':
    case 'subClass':
    case 'subClassDistrict':
      projectList = projects
        .filter(
          (p) =>
            !p.projectGroup &&
            !p.projectLocation &&
            !name.toLocaleLowerCase().includes('suurpiiri'),
        )
        .filter((p) => p.projectClass === id);
      break;
    case 'group':
      projectList = projects.filter((p) => p.projectGroup).filter((p) => p.projectGroup === id);
      break;
    case 'district':
    case 'division':
      projectList = projects.filter((p) => !p.projectGroup).filter((p) => p.projectLocation === id);
      break;
  }
  return sortByName(projectList) as Array<IProject>;
};

/**
 * Builds a PlanningRow object from a class, location or group
 */
export const buildPlanningRow = (
  item: IClass | ILocation | IGroup,
  type: PlanningRowType,
  projects: Array<IProject>,
  expanded?: boolean,
): IPlanningRow => {
  const projectRows = getSortedProjects(item.id, type, projects, item.name);
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
