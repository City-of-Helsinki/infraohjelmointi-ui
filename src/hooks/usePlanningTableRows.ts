import {
  getClassesThunk,
  selectClasses,
  selectMasterClasses,
  // selectSelectedClass,
  // selectSelectedMasterClass,
  // selectSelectedSubClass,
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
  const getRowProps = (
    item: IClass | ILocation,
    type: PlanningTableRowType,
  ): Omit<IPlanningTableRow, 'childRows'> => ({
    type,
    name: item.name,
    path: item.path,
    id: item.id,
    key: item.id,
  });

  const masterClasses = selectedMasterClass ? [selectedMasterClass] : allMasterClasses;
  const classes = selectedClass ? [selectedClass] : allClasses;
  const subClasses = selectedSubClass ? [selectedSubClass] : allSubClasses;
  const districts = selectedDistrict ? [selectedDistrict] : allDistricts;

  // Map master classes
  const planningTableRows: Array<IPlanningTableRow> = masterClasses.map((masterClass) => ({
    ...getRowProps(masterClass, 'masterClass'),
    // Map classes
    childRows: classes
      .filter((c) => c.parent === masterClass.id)
      .map((filteredClass) => ({
        ...getRowProps(filteredClass, 'class'),
        // Map sub classes
        childRows: subClasses
          .filter((subClass) => subClass.parent === filteredClass.id)
          .map((filteredSubClass) => ({
            ...getRowProps(filteredSubClass, 'subClass'),
            // Map districts
            childRows: districts
              .filter((district) => district.parentClass === filteredSubClass.id)
              .map((filteredDistrict) => ({
                ...getRowProps(filteredDistrict, 'district'),
                // Map divisions
                childRows: divisions
                  .filter((division) => division.parent === filteredDistrict.id)
                  .map((filteredDivision) => ({
                    ...getRowProps(filteredDivision, 'division'),
                    childRows: [
                      /* Groups > Projects */
                    ],
                  })),
              })),
          })),
      })),
  }));

  const getDistrictRows = districts.map((district) => ({
    ...getRowProps(district, 'district'),
    childRows: divisions
      .filter((division) => division.parent === district.id)
      .map((filteredDivision) => ({
        ...getRowProps(filteredDivision, 'division'),
        childRows: [
          /* Groups > Projects */
        ],
      })),
  }));

  return districts.length === 1 ? getDistrictRows : planningTableRows;
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
