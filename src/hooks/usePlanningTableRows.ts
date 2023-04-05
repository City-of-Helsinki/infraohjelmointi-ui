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

export type PlanningTableRowType =
  | 'masterClass'
  | 'class'
  | 'subClass'
  | 'district-preview'
  | 'district'
  | 'division'
  | 'group'
  | 'project';

export interface IPlanningTableRow {
  type: PlanningTableRowType;
  name: string;
  path: string;
  childRows: Array<IPlanningTableRow>;
  id: string;
  key: string;
  defaultExpanded: boolean;
}

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

  const getRowProps = (
    item: IClass | ILocation,
    type: PlanningTableRowType,
    defaultExpanded?: boolean,
  ): Omit<IPlanningTableRow, 'childRows'> => ({
    type: type,
    name: item.name,
    path: item.path,
    id: item.id,
    key: item.id,
    // Show all children to selectedDistrict
    defaultExpanded: defaultExpanded || false,
  });

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

  return districts.length === 1 ? locationRows : classRows;
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
    console.log('setting master class: ', masterClassId);

    setSelectedMasterClass(
      masterClassId ? (masterClasses.find((mc) => mc.id === masterClassId) as IClass) : null,
    );
  }, [masterClassId, masterClasses]);

  // set selectedClass if it appears in the url, if the url param id is removed, then it will be set to null (i.e, the user navigates back)
  useEffect(() => {
    console.log('setting class class: ', classId);
    setSelectedClass(classId ? (classes.find((c) => c.id === classId) as IClass) : null);
  }, [classId, classes]);

  // set selectedSubClass if it appears in the url, if the url param id is removed, then it will be set to null (i.e, the user navigates back)
  useEffect(() => {
    console.log('setting sub class: ', subClassId);

    setSelectedSubClass(
      subClassId ? (subClasses.find((sc) => sc.id === subClassId) as IClass) : null,
    );
  }, [subClassId, subClasses]);

  // set selectedDistrict if it appears in the url, if the url param id is removed, then it will be set to null (i.e, the user navigates back)
  useEffect(() => {
    console.log('setting district: ', districtId);

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
