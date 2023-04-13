import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import { useAppSelector } from './common';
import { selectDistricts, selectDivisions } from '@/reducers/locationSlice';
import { useEffect, useState } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { useParams } from 'react-router';
import { IPlanningTableRow, PlanningTableRowType } from '@/interfaces/common';

interface IPlanningRowLists {
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  districts: Array<ILocation>;
  divisions: Array<ILocation>;
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
  item: IClass | ILocation,
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

const buildPlanningTableRows = (state: IPlanningRowsState) => {
  const {
    selections: { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict },
    lists: { masterClasses, classes, subClasses, districts, divisions },
  } = state;

  const getRowProps = (
    item: IClass | ILocation,
    type: PlanningTableRowType,
    defaultExpanded?: boolean,
  ): Omit<IPlanningTableRow, 'children'> => {
    return {
      type: type,
      name: item.name,
      path: item.path,
      id: item.id,
      key: item.id,
      link: getLink(item, type, state.selections),
      defaultExpanded: defaultExpanded || false,
    };
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
            // Map districts
            children: districts
              .filter((district) => district.parentClass === filteredSubClass.id)
              .map((filteredDistrict) => ({
                ...getRowProps(filteredDistrict, 'district-preview'),
                children: [],
              })),
          })),
      })),
  }));

  // Map the selected districts divisions and the groups & projects that belong to those divisions
  const projectRows = districts.map((district) => ({
    ...getRowProps(district, 'district', true),
    children: divisions
      .filter((division) => division.parent === district.id)
      .map((filteredDivision) => ({
        ...getRowProps(filteredDivision, 'division', true),
        children: [
          /* Groups > Projects */
        ],
      })),
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

  const [planningRowsState, setPlanningRowsState] = useState<IPlanningRowsState>({
    lists: {
      masterClasses: [],
      classes: [],
      subClasses: [],
      districts: [],
      divisions: [],
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

  return {
    rows,
    selections: planningRowsState.selections,
  };
};

export default usePlanningTableRows;
