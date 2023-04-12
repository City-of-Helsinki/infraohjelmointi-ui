import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import { useAppSelector } from './common';
import { selectDistricts, selectDivisions } from '@/reducers/locationSlice';
import { useEffect, useState } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { useParams } from 'react-router';
import { IPlanningTableRow, PlanningTableRowType } from '@/interfaces/common';
import { selectGroups } from '@/reducers/groupSlice';
import { IGroup } from '@/interfaces/groupInterfaces';

interface IPlanningRowLists {
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  districts: Array<ILocation>;
  divisions: Array<ILocation>;
  groups: Array<IGroup>;
}

interface IPlanningRowSelections {
  selectedMasterClass: IClass | null;
  selectedClass: IClass | null;
  selectedSubClass: IClass | null;
  selectedDistrict: ILocation | null;
}

interface IPlanningRowsState {
  lists: IPlanningRowLists;
  selections: IPlanningRowSelections;
}

/**
 * Returns false whether a given row is already selected and present in the url.
 *
 * @param type the type of the row
 * @param selections current row selections for all the rows
 */
const shouldNavigate = (type: PlanningTableRowType, selections: IPlanningRowSelections) => {
  const { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict } = selections;
  switch (type) {
    case 'masterClass':
      return !selectedMasterClass;
    case 'class':
      return !selectedClass;
    case 'subClass':
      return !selectedSubClass;
    case 'district-preview':
      return !selectedDistrict;
    default:
      return false;
  }
};

/**
 * Builds a link for a row. If the current rows type is already selected,
 * i.e. the row is a masterClass and there already is a selectedMasterClass, it will return null.
 *
 * @param item class or location
 * @param type the type that the link is created for
 */
const getLink = (
  item: IClass | ILocation | IGroup,
  type: PlanningTableRowType,
  selections: IPlanningRowSelections,
): string | null => {
  const { selectedMasterClass, selectedClass, selectedSubClass } = selections;

  if (shouldNavigate(type, selections)) {
    return [selectedMasterClass?.id, selectedClass?.id, selectedSubClass?.id, item.id]
      .join('/')
      .replace(/(\/{2,})/gm, '/') // replace triple /// with one in case of one of values is undefined/null
      .replace(/(^\/)|(\/$)/gm, ''); // remove the last and first / in case of the last one of values is undefined/null
  } else {
    return null;
  }
};

/**
 * Builds a hierarchy-list of IPlanningTableRows, that will either include
 * - masterClasses, classes, subClasses, groups and districts; if a district isn't selected
 * - districts, divisions and groups; if a district is selected
 *
 * ! Groups will mostly appear under the selected divisions, but they can also appear under
 * districts and subClasses
 *
 * @param state the current state of the planningRows-hook
 * @returns a list of planning rows for the planning table
 */
const buildPlanningTableRows = (state: IPlanningRowsState) => {
  const {
    selections: { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict },
    lists: { masterClasses, classes, subClasses, districts, divisions, groups },
  } = state;

  const getRowProps = (
    item: IClass | ILocation | IGroup,
    type: PlanningTableRowType,
    defaultExpanded?: boolean,
  ): IPlanningTableRow => {
    return {
      type: type,
      name: item.name,
      path: type !== 'group' ? (item as IClass | ILocation).path : '',
      id: item.id,
      key: item.id,
      link: getLink(item, type, state.selections),
      defaultExpanded: defaultExpanded || false,
      children: [],
    };
  };

  // Groups can get mapped under subClasses, districts and divisions
  const mapGroups = (id: string, type: PlanningTableRowType) => {
    const filteredGroups = [];
    // Filter groups under subClass only if there are is no districtRelation
    if (type === 'subClass') {
      filteredGroups.push(
        ...groups.filter((group) => !group.districtRelation && group.classRelation === id),
      );
    }
    // Filter groups under division or district
    else if (type === 'division' || type == 'district') {
      filteredGroups.push(...groups.filter((group) => group.districtRelation === id));
    }
    return filteredGroups.map((group) => ({
      ...getRowProps(group, 'group'),
      children: [
        // Projects
      ],
    }));
  };

  // Map the class rows going from masterClasses to districts
  const classRows: Array<IPlanningTableRow> = masterClasses.map((masterClass) => ({
    ...getRowProps(masterClass, 'masterClass', !!selectedMasterClass),
    // Map classes
    children: classes
      .filter((c) => c.parent === masterClass.id)
      .map((filteredClass) => ({
        ...getRowProps(filteredClass, 'class', !!selectedClass),
        // Map sub classes
        children: subClasses
          .filter((subClass) => subClass.parent === filteredClass.id)
          .map((filteredSubClass) => ({
            ...getRowProps(filteredSubClass, 'subClass', !!selectedSubClass),
            // Map districts & groups (groups only if they do not belong to a district)
            children: [
              ...districts
                .filter((district) => district.parentClass === filteredSubClass.id)
                .map((filteredDistrict) => ({
                  ...getRowProps(filteredDistrict, 'district-preview'),
                  // Clicking a district will render the projectRows-list, so no children are needed
                })),
              ...mapGroups(filteredSubClass.id, 'subClass'),
            ],
          })),
      })),
  }));

  // Map the selected districts divisions and the groups & projects that belong to those divisions
  const projectRows = districts.map((district) => ({
    ...getRowProps(district, 'district', true),
    // Map divisions & groups (groups only if there are no divisions)
    children: [
      ...divisions
        .filter((division) => division.parent === district.id)
        .map((filteredDivision) => ({
          ...getRowProps(filteredDivision, 'division', true),
          // Map projects & groups
          children: [
            ...mapGroups(filteredDivision.id, 'division'),
            /* Projects */
          ],
        })),
      ...mapGroups(district.id, 'district'),
    ],
  }));

  return selectedDistrict ? projectRows : classRows;
};

/**
 * Returns the selected class or location from a list of classes or locations if it's found,
 * otherwise it will return null if no selection is made or found.
 *
 * @param list class or location list to compare
 * @param id id of the item to compare
 */
const getSelectedItemOrNull = (list: Array<IClass | ILocation>, id: string | undefined) =>
  (id ? list.find((l) => l.id === id) : null) as IClass | ILocation | null;

/**
 * Creates a row hierarchy of masterClasses, classes, subClasses, districts and divisions for the PlanningTable
 *
 * It also listens to the url params for a masterClassId, classId, subClassId or districtId which it will
 * use to return the currently selected (opened/expanded) rows.
 *
 * @returns rows for the PlanningTable and the currently selected rows
 */
const usePlanningTableRows = () => {
  const { masterClassId, classId, subClassId, districtId } = useParams();

  const allMasterClasses = useAppSelector(selectMasterClasses);
  const allClasses = useAppSelector(selectClasses);
  const allSubClasses = useAppSelector(selectSubClasses);
  const allDistricts = useAppSelector(selectDistricts);
  const allDivisions = useAppSelector(selectDivisions);
  const allGroups = useAppSelector(selectGroups);

  const [planningRowsState, setPlanningRowsState] = useState<IPlanningRowsState>({
    lists: {
      masterClasses: [],
      classes: [],
      subClasses: [],
      districts: [],
      divisions: [],
      groups: [],
    },
    selections: {
      selectedMasterClass: null,
      selectedClass: null,
      selectedSubClass: null,
      selectedDistrict: null,
    },
  });

  const [rows, setRows] = useState<Array<IPlanningTableRow>>([]);

  useEffect(() => {
    setRows(buildPlanningTableRows(planningRowsState));
  }, [planningRowsState]);

  /**
   * React to changes in allMasterClasses and the masterClassId from the url,
   * if selected is found it will be the only item in the list
   */
  useEffect(() => {
    const selectedMasterClass = getSelectedItemOrNull(allMasterClasses, masterClassId);

    setPlanningRowsState((current) => ({
      ...current,
      selections: {
        ...current.selections,
        selectedMasterClass,
      },
      lists: {
        ...current.lists,
        masterClasses: selectedMasterClass ? [selectedMasterClass] : allMasterClasses,
      },
    }));
  }, [masterClassId, allMasterClasses]);

  /**
   * React to changes in allClasses and the classId from the url,
   * if selected is found it will be the only item in the list
   */
  useEffect(() => {
    const selectedClass = getSelectedItemOrNull(allClasses, classId);

    setPlanningRowsState((current) => ({
      ...current,
      selections: {
        ...current.selections,
        selectedClass,
      },
      lists: {
        ...current.lists,
        classes: selectedClass ? [selectedClass] : allClasses,
      },
    }));
  }, [classId, allClasses]);

  /**
   * React to changes in allSubClasses and the subClassId from the url,
   * if selected is found it will be the only item in the list
   */
  useEffect(() => {
    const selectedSubClass = getSelectedItemOrNull(allSubClasses, subClassId);

    setPlanningRowsState((current) => ({
      ...current,
      selections: {
        ...current.selections,
        selectedSubClass,
      },
      lists: {
        ...current.lists,
        subClasses: selectedSubClass ? [selectedSubClass] : allSubClasses,
      },
    }));
  }, [subClassId, allSubClasses]);

  /**
   * React to changes in allDistricts and the districtId from the url,
   * if selected is found it will be the only item in the list
   */
  useEffect(() => {
    const selectedDistrict = getSelectedItemOrNull(allDistricts, districtId) as ILocation;

    setPlanningRowsState((current) => ({
      ...current,
      selections: {
        ...current.selections,
        selectedDistrict,
      },
      lists: {
        ...current.lists,
        districts: selectedDistrict ? [selectedDistrict] : allDistricts,
      },
    }));
  }, [districtId, allDistricts]);

  // React to changes in allDivisions
  useEffect(() => {
    setPlanningRowsState((current) => ({
      ...current,
      lists: {
        ...current.lists,
        divisions: allDivisions,
      },
    }));
  }, [allDivisions]);

  // React to changes in allGroups
  useEffect(() => {
    setPlanningRowsState((current) => ({
      ...current,
      lists: {
        ...current.lists,
        groups: allGroups,
      },
    }));
  }, [allGroups]);

  return {
    rows,
    selections: planningRowsState.selections,
  };
};

export default usePlanningTableRows;
