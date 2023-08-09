import { IClass } from '@/interfaces/classInterfaces';
import {
  PlanningRowType,
  IPlanningRow,
  IPlanningRowSelections,
  IPlanningSearchParams,
} from '@/interfaces/planningInterfaces';
import { IGroup } from '@/interfaces/groupInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { calculatePlanningCells, calculatePlanningRowSums } from './calculations';
import { IProject } from '@/interfaces/projectInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { IClassHierarchy, ICoordinatorClassHierarchy } from '@/reducers/classSlice';

// These utils are used by the usePlanningRows and useCoordinationRows

/**
 * Takes a list of groups or projects and returns them sorted by their name
 */
export const sortByName = (list: Array<IProject> | Array<IGroup>) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Filters projects under an IPlanningRow in the coordinator mode if the correct conditions are met.
 *
 * @param id the id of the current item that the row is being created for
 * @param type IPlanningRowType
 * @param projects projects to map
 */
export const filterProjectsForCoordinatorRow = (
  id: string,
  type: PlanningRowType,
  projects: Array<IProject>,
) => {
  const getProjectsForClasses = () =>
    projects.filter((p) => !p.projectLocation && p.projectClass === id);

  const getProjectsForLocation = () => projects.filter((p) => p.projectLocation === id);

  switch (type) {
    case 'class':
    case 'subClass':
    case 'collectiveSubLevel':
    case 'otherClassification':
      return sortByName(getProjectsForClasses()) as Array<IProject>;
    case 'district':
    case 'subLevelDistrict':
    case 'division':
    case 'districtPreview':
      return sortByName(getProjectsForLocation()) as Array<IProject>;
  }
  return [];
};

/**
 * Filters projects under an IPlanningRow in the planning mode if the correct conditions are met.
 *
 * @param id the id of the current item that the row is being created for
 * @param type IPlanningRowType
 * @param projects projects to map
 * @param districtsForSubClass when the type is a subClassDistrict then we will not render districts under that subClass but would still need the projects that belong to those districts to appear under the subClassDistrict.
 */
export const filterProjectsForPlanningRow = (
  id: string,
  type: PlanningRowType,
  projects: Array<IProject>,
  districtsForSubClass?: Array<IClass>,
) => {
  const getProjectsForClasses = () =>
    projects.filter((p) => !p.projectGroup && !p.projectLocation && p.projectClass === id);

  const getProjectsForSubClassDistrict = () => {
    const projectHasDistrictOrNoLocation = (p: IProject) =>
      districtsForSubClass?.some((d) => d.id === p.projectLocation) ?? !p.projectLocation;

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
  isCoordinator?: boolean,
): IPlanningRow => {
  const projectRows = isCoordinator
    ? filterProjectsForCoordinatorRow(item.id, type, projects)
    : filterProjectsForPlanningRow(item.id, type, projects, districtsForSubClass);
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

/**
 * Fetches projects for a given location or class.
 *
 * It will add the direct=true parameter to the search query if we're fetching projects for classes or subClasses, which
 * will only return projects that are directly underneath that class or subClass (children ignored).
 *
 * @returns a promise list of projects.
 */
export const fetchProjectsByRelation = async (
  type: PlanningRowType,
  id: string | undefined,
  isCoordinator?: boolean,
): Promise<Array<IProject>> => {
  const direct = type === 'class' || type === 'subClass' || type === 'subClassDistrict';
  try {
    const allResults = await getProjectsWithParams(
      {
        params: `${type}=${id}`,
        direct: direct,
        programmed: true,
      },
      isCoordinator,
    );
    return allResults.results;
  } catch (e) {
    console.log('Error fetching projects by relation: ', e);
  }
  return [];
};

/**
 * Checks if there is a selectedClass, selectedSubClass or selectedDistrict and returns
 * the type and id for that, prioritizing the lowest row.
 */
export const getTypeAndIdForLowestExpandedRow = (selections: IPlanningRowSelections) => {
  const {
    selectedClass,
    selectedSubClass,
    selectedDistrict,
    selectedOtherClassification,
    selectedSubLevelDistrict,
    selectedCollectiveSubLevel,
  } = selections;
  if (selectedOtherClassification) {
    return { type: 'otherClassification', id: selectedOtherClassification.id };
  } else if (selectedSubLevelDistrict) {
    return { type: 'subLevelDistrict', id: selectedSubLevelDistrict.id };
  } else if (selectedCollectiveSubLevel) {
    return { type: 'collectiveSubLevel', id: selectedCollectiveSubLevel.id };
  } else if (selectedDistrict) {
    return { type: 'district', id: selectedDistrict.id };
  } else if (selectedSubClass) {
    return { type: 'subClass', id: selectedSubClass.id };
  } else if (selectedClass) {
    return { type: 'class', id: selectedClass.id };
  } else {
    return { type: null, id: null };
  }
};

/**
 * Tries to find a related item (class or location) for a given items list (a list of classes or locations)
 *
 * @param relatedItem IClass | ILocation
 * @param items Array<IClass> | Array<ILocation>
 *
 * @returns
 */
const getRelatedItem = (
  relatedItem?: IClass | ILocation | null,
  items?: Array<IClass> | Array<ILocation>,
) => {
  if (items && relatedItem) {
    return items.find((i) => i.relatedTo === relatedItem?.id);
  }
};

/**
 * Tries to find the parent class or location from a given class or location list.
 *
 * @param child IClass | ILocation
 * @param parents Array<IClass> | Array<ILocation>
 *
 * @returns
 */
const findParent = (child: IClass | ILocation, parents: Array<IClass> | Array<ILocation>) =>
  parents.filter((p) => p.id === child.parent)[0];

/**
 * Builds a url with either 'planning' or 'coordination' route and adds given search params to the url.
 *
 * @param path 'planning' or 'coordination'
 * @param params IPlanningSearchParams
 */
const buildUrl = (path: 'planning' | 'coordination', params: IPlanningSearchParams) => {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return `/${path}?${queryParams.toString()}`;
};

/**
 * Tries to find a coordination district for a planning subclass if the sub classes name include 'suurpiiri'.
 *
 * @param selectedSubClass
 * @param planningDistricts
 * @param coordinationDistricts
 *
 * @returns
 */
const getCoordinationDistrictForSubClass = (
  planningSubClass: IClass | null,
  planningDistricts: Array<ILocation>,
  coordinationDistricts: Array<ILocation>,
) => {
  // Add a selected district using the subClass if the subClasses name is 'suurpiiri'

  if (
    planningSubClass &&
    /suurpiiri|östersundom/.test(planningSubClass?.name.toLocaleLowerCase() ?? '')
  ) {
    // First we need get the planning district because the coordination districts don't have relations with
    // the planning subclass
    const planningDistrictForSubClass = planningDistricts.find((d) => {
      return d.parentClass === planningSubClass?.id;
    });

    // We use the found planning district to find the relation to the coordination district
    const coordinationDistrictForSubClass = coordinationDistricts.find((d) => {
      return d.relatedTo === planningDistrictForSubClass?.id;
    });

    return coordinationDistrictForSubClass;
  }
};

/**
 * Tries to find the lowest selected coordinator class for planning class selections. It will return
 * the districts parent if the district param is given, otherwise it will look it there is a
 * selectedSubClass > selectedClass > selectMasterClass.
 *
 * @param allClasses Array<IClass>
 * @param selections IPlanningRowSelections
 * @param district ILocation
 *
 * @returns
 */
const getLowestSelectedCoordinatorClass = (
  allCoordinatorClasses: Array<IClass>,
  selections: IPlanningRowSelections,
  district?: ILocation,
) => {
  // If the district is given we can assume that
  if (district) {
    return allCoordinatorClasses.find((ac) => ac.id === district?.parentClass);
  } else {
    const { selectedMasterClass, selectedClass, selectedSubClass } = selections;

    return getRelatedItem(
      selectedSubClass ?? selectedClass ?? selectedMasterClass,
      allCoordinatorClasses,
    );
  }
};

/**
 * Builds a coordination url with the converted selections using the planning views selection.
 *
 * @param coordinationClasses
 * @param coordinationDistricts
 * @param planningDistricts
 * @param selections
 *
 * @returns
 */
export const getCoordinationUrlFromPlanningSelections = (
  coordinationClasses: ICoordinatorClassHierarchy,
  coordinationDistricts: Array<ILocation>,
  planningDistricts: Array<ILocation>,
  selections: IPlanningRowSelections,
) => {
  const {
    masterClasses,
    classes,
    subClasses,
    collectiveSubLevels,
    otherClassifications,
    otherClassificationSubLevels,
    allClasses,
  } = coordinationClasses;

  const { selectedSubClass, selectedDistrict } = selections;
  const params: IPlanningSearchParams = {};

  // Get the district using the selectedSubClass if the subClasses name includes 'suurpiiri'
  const coordinationDistrictForSubClass = getCoordinationDistrictForSubClass(
    selectedSubClass,
    planningDistricts,
    coordinationDistricts,
  );

  // Find the lowest selected class using either the coordinationDistrictForSubClass or the search param selections,
  // if a target is found we return undefined to prevent unnecessary iteration
  const findClass = (classesToFilter: Array<IClass>, foundClass?: IClass) => {
    if (foundClass) {
      return undefined;
    }

    const lowestSelectedClass = getLowestSelectedCoordinatorClass(
      allClasses,
      selections,
      coordinationDistrictForSubClass,
    );

    return classesToFilter.find((i) => i.id === lowestSelectedClass?.id);
  };

  // We make sure not to iterate over unnecessary levels if the lowest level is found
  const otherClassificationSubLevel = findClass(otherClassificationSubLevels);
  const otherClassification = findClass(otherClassifications, otherClassificationSubLevel);
  const collectiveSubLevel = findClass(collectiveSubLevels, otherClassification);
  const coordinationSubClass = findClass(subClasses, collectiveSubLevel);
  const coordinationClass = findClass(classes, coordinationSubClass);
  const coordinationMasterClass = findClass(masterClasses, coordinationClass);

  // Apply search params to the url from the highest level downwards
  if (otherClassificationSubLevel) {
    const otherClassification = findParent(otherClassificationSubLevel, otherClassifications);
    const collectiveSubLevel = findParent(otherClassification, collectiveSubLevels);
    const coordinationSubClass = findParent(collectiveSubLevel, subClasses);
    const coordinationClass = findParent(coordinationSubClass, classes);
    const coordinationMasterClass = findParent(coordinationClass, masterClasses);

    params.masterClass = coordinationMasterClass.id;
    params.class = coordinationClass.id;
    params.subClass = coordinationSubClass.id;
    params.collectiveSubLevel = collectiveSubLevel.id;
    params.otherClassification = otherClassification.id;
    params.otherClassificationSubLevel = otherClassificationSubLevel.id;
  } else if (otherClassification) {
    const collectiveSubLevel = findParent(otherClassification, collectiveSubLevels);
    const coordinationSubClass = findParent(collectiveSubLevel, subClasses);
    const coordinationClass = findParent(coordinationSubClass, classes);
    const coordinationMasterClass = findParent(coordinationClass, masterClasses);

    params.masterClass = coordinationMasterClass.id;
    params.class = coordinationClass.id;
    params.subClass = coordinationSubClass.id;
    params.collectiveSubLevel = collectiveSubLevel.id;
    params.otherClassification = otherClassification.id;
  } else if (collectiveSubLevel) {
    const coordinationSubClass = findParent(collectiveSubLevel, subClasses);
    const coordinationClass = findParent(coordinationSubClass, classes);
    const coordinationMasterClass = findParent(coordinationClass, masterClasses);

    params.masterClass = coordinationMasterClass.id;
    params.class = coordinationClass.id;
    params.subClass = coordinationSubClass.id;
    params.collectiveSubLevel = collectiveSubLevel.id;
  } else if (coordinationSubClass) {
    const coordinationClass = findParent(coordinationSubClass, classes);
    const coordinationMasterClass = findParent(coordinationClass, masterClasses);

    params.masterClass = coordinationMasterClass.id;
    params.class = coordinationClass.id;
    params.subClass = coordinationSubClass.id;
  } else if (coordinationClass) {
    const coordinationMasterClass = findParent(coordinationClass, masterClasses);

    params.masterClass = coordinationMasterClass.id;
    params.class = coordinationClass.id;
  } else if (coordinationMasterClass) {
    params.masterClass = coordinationMasterClass.id;
  }

  const districtKey = collectiveSubLevel ? 'subLevelDistrict' : 'district';

  // Set the district as 'subLevelDistrict' if it appears alongside a 'collectiveSubLevel'
  if (coordinationDistrictForSubClass) {
    params[districtKey] = coordinationDistrictForSubClass?.id;
  }

  if (selectedDistrict && !params[districtKey]) {
    const coordinationDistrict = coordinationDistricts.find(
      (cd) => cd.relatedTo === selectedDistrict?.id,
    );
    if (coordinationDistrict) {
      params[districtKey] = coordinationDistrict.id;
    }
  }

  return buildUrl('coordination', params);
};

/**
 * Builds a planning url with the converted selections using the coordination views selection.
 *
 * @param planningClasses IClassHierarchy
 * @param planningDistricts Array<ILocation>
 * @param selections IPlanningRowSelections
 *
 * @returns
 */
export const getPlanningUrlFromCoordinationSelections = (
  planningClasses: IClassHierarchy,
  planningDistricts: Array<ILocation>,
  selections: IPlanningRowSelections,
) => {
  const { masterClasses, classes, subClasses, allClasses } = planningClasses;

  const {
    selectedMasterClass,
    selectedClass,
    selectedSubClass,
    selectedDistrict,
    selectedCollectiveSubLevel,
    selectedOtherClassification,
    selectedSubLevelDistrict,
  } = selections;

  const params: IPlanningSearchParams = {};

  // Try to find the planning district from the coordination district selection
  const planningDistrict = planningDistricts.find(
    (pd) => pd.id === selectedDistrict?.relatedTo || pd.id === selectedSubLevelDistrict?.relatedTo,
  );

  // Get the districts parent class
  const districtsParent = allClasses.find((ac) => ac.id === planningDistrict?.parentClass);

  // If the districs parents name includes 'suurpiiri' we ignore setting the district param because
  // the planning view wants all 'suurpiiri' classes as the lowest selected level
  if (
    districtsParent &&
    /suurpiiri|östersundom/.test(districtsParent?.name.toLocaleLowerCase() ?? '')
  ) {
    params.subClass = districtsParent.id;
  } else if (planningDistrict) {
    params.subClass = districtsParent?.id;
    params.district = planningDistrict?.id;
  }

  // Find the lowest selectedClass from the coordination selections, if a target is found we return undefined
  // to prevent unnecessary iteration
  const findClass = (classesToFilter: Array<IClass>, foundClass?: IClass | string) => {
    if (foundClass) {
      return undefined;
    }

    const lowestSelectedClass =
      selectedOtherClassification ??
      selectedCollectiveSubLevel ??
      selectedSubClass ??
      selectedClass ??
      selectedMasterClass;

    return classesToFilter.find((ctf) => ctf.id === lowestSelectedClass?.relatedTo);
  };

  const planningSubClass = findClass(subClasses, params.subClass);
  const planningClass = findClass(classes, planningSubClass);
  const planningMasterClass = findClass(masterClasses, planningClass);

  if (planningSubClass) {
    const planningClass = findParent(planningSubClass, classes);
    params.masterClass = findParent(planningClass, masterClasses).id;
    params.class = planningClass.id;
    params.subClass = planningSubClass.id;
  } else if (planningClass) {
    params.masterClass = findParent(planningClass, masterClasses).id;
    params.class = planningClass.id;
  } else if (planningMasterClass) {
    params.masterClass = planningMasterClass.id;
  }

  console.log('params: ', params);

  return buildUrl('planning', params);
};

/**
 * Parses a masterClass name and returns the number value at the beginning of the name.
 */
const parseNumberFromMasterClassName = (name: string) => parseInt(name.split(' ')[0]);

/**
 * Sorts a list of masterClasses by their numerical value
 */
export const sortMasterClassesByName = (masterClasses: Array<IClass>) =>
  [...masterClasses].sort(
    (a, b) => parseNumberFromMasterClassName(a.name) - parseNumberFromMasterClassName(b.name),
  );
