import {
  getClassesThunk,
  selectClasses,
  selectMasterClasses,
  selectSubClasses,
  setClasses,
  setMasterClasses,
  setSubClasses,
} from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import { selectDistricts, selectDivisions } from '@/reducers/locationSlice';
import { useEffect, useState } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { useParams } from 'react-router';
import { IPlanningTableRow, PlanningTableRowType } from '@/interfaces/common';

const buildPlanningTableRows = (
  allMasterClasses: Array<IClass>,
  allClasses: Array<IClass>,
  allSubClasses: Array<IClass>,
  allDistricts: Array<ILocation>,
  divisions: Array<ILocation>,
  selectedMasterClass: IClass | null,
  selectedClass: IClass | null,
  selectedSubClass: IClass | null,
  selectedDistrict: ILocation | null,
) => {
  const masterClasses = selectedMasterClass ? [selectedMasterClass] : allMasterClasses;
  const classes = selectedClass ? [selectedClass] : allClasses;
  const subClasses = selectedSubClass ? [selectedSubClass] : allSubClasses;
  const districts = selectedDistrict ? [selectedDistrict] : allDistricts;

  const getLink = (item: IClass | ILocation, type: PlanningTableRowType) => {
    const shouldNavigate =
      (type === 'masterClass' && selectedMasterClass === null) ||
      (type === 'class' && selectedClass === null) ||
      (type === 'subClass' && selectedSubClass === null) ||
      (type === 'district-preview' && selectedDistrict === null);

    if (shouldNavigate) {
      const linkArray = [selectedMasterClass?.id, selectedClass?.id, selectedSubClass?.id];

      const isChildNotSelected =
        !(selectedMasterClass && type === 'masterClass') &&
        !(selectedClass && type === 'class') &&
        !(selectedSubClass && type === 'subClass') &&
        !(selectedDistrict && type === 'district-preview');

      if (isChildNotSelected) {
        linkArray.push(item.id);
      }
      return linkArray
        .join('/')
        .replace(/(\/{2,})/gm, '/') // replace triple /// with one in case of one of values is undefined/null
        .replace(/(^\/)|(\/$)/gm, ''); // remove the last and first / in case of the last one of values is undefined/null
    } else {
      return null;
    }
  };

  const getRowProps = (
    item: IClass | ILocation,
    type: PlanningTableRowType,
    defaultExpanded?: boolean,
  ): Omit<IPlanningTableRow, 'childRows'> => {
    return {
      type: type,
      name: item.name,
      path: item.path,
      id: item.id,
      key: item.id,
      link: getLink(item, type),
      defaultExpanded: defaultExpanded || false,
    };
  };

  // Map the class rows going from masterClasses to districts
  const classRows: Array<IPlanningTableRow> = masterClasses.map((masterClass) => ({
    ...getRowProps(masterClass, 'masterClass', !!selectedMasterClass),
    // Map classes
    childRows: classes
      .filter((c) => c.parent === masterClass.id)
      .map((filteredClass) => ({
        ...getRowProps(filteredClass, 'class', !!selectedClass),
        // Map sub classes
        childRows: subClasses
          .filter((subClass) => subClass.parent === filteredClass.id)
          .map((filteredSubClass) => ({
            ...getRowProps(filteredSubClass, 'subClass', !!selectedSubClass),
            // Map districts
            childRows: districts
              .filter((district) => district.parentClass === filteredSubClass.id)
              .map((filteredDistrict) => ({
                ...getRowProps(filteredDistrict, 'district-preview'),
                childRows: [],
              })),
          })),
      })),
  }));

  // Map the selected districts divisions and the groups & projects that belong to those divisions
  const locationRows = districts.map((district) => ({
    ...getRowProps(district, 'district', true),
    childRows: divisions
      .filter((division) => division.parent === district.id)
      .map((filteredDivision) => ({
        ...getRowProps(filteredDivision, 'division', true),
        childRows: [
          /* Groups > Projects */
        ],
      })),
  }));

  return selectedDistrict ? locationRows : classRows;
};

const usePlanningTableRows = () => {
  const dispatch = useAppDispatch();
  const { masterClassId, classId, subClassId, districtId } = useParams();

  const [selectedMasterClass, setSelectedMasterClass] = useState<IClass | null>(null);
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [selectedSubClass, setSelectedSubClass] = useState<IClass | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<ILocation | null>(null);

  const masterClasses = useAppSelector(selectMasterClasses);
  const classes = useAppSelector(selectClasses);
  const subClasses = useAppSelector(selectSubClasses);
  const districts = useAppSelector(selectDistricts);
  const divisions = useAppSelector(selectDivisions);

  const [rows, setRows] = useState<Array<IPlanningTableRow>>([]);

  useEffect(() => {
    dispatch(getClassesThunk()).then(() => {
      dispatch(setMasterClasses());
      dispatch(setClasses());
      dispatch(setSubClasses());
    });
  }, []);

  useEffect(() => {
    setRows(
      buildPlanningTableRows(
        masterClasses,
        classes,
        subClasses,
        districts,
        divisions,
        selectedMasterClass,
        selectedClass,
        selectedSubClass,
        selectedDistrict,
      ),
    );
    // Only listen to subClasses and divisions since they are populated last
  }, [
    subClasses,
    divisions,
    selectedMasterClass,
    selectedClass,
    selectedSubClass,
    selectedDistrict,
  ]);

  // set selectedMasterClass if it appears in the url, if the url param id is removed, then it will be set to null (i.e, the user navigates back)
  useEffect(() => {
    setSelectedMasterClass(
      masterClassId ? (masterClasses.find((mc) => mc.id === masterClassId) as IClass) : null,
    );
  }, [masterClassId, masterClasses]);

  // set selectedClass if it appears in the url, if the url param id is removed, then it will be set to null (i.e, the user navigates back)
  useEffect(() => {
    setSelectedClass(classId ? (classes.find((c) => c.id === classId) as IClass) : null);
  }, [classId, classes]);

  // set selectedSubClass if it appears in the url, if the url param id is removed, then it will be set to null (i.e, the user navigates back)
  useEffect(() => {
    setSelectedSubClass(
      subClassId ? (subClasses.find((sc) => sc.id === subClassId) as IClass) : null,
    );
  }, [subClassId, subClasses]);

  console.log('selected subClass in hook: ', selectedSubClass);

  // set selectedDistrict if it appears in the url, if the url param id is removed, then it will be set to null (i.e, the user navigates back)
  useEffect(() => {
    setSelectedDistrict(
      districtId ? (districts.find((d) => d.id === districtId) as ILocation) : null,
    );
  }, [districtId, districts]);

  return {
    rows,
    selections: { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict },
  };
};

export default usePlanningTableRows;
