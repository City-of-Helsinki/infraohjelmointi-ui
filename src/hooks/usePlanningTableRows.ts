import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import { useAppSelector } from './common';
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
      return [selectedMasterClass?.id, selectedClass?.id, selectedSubClass?.id, item.id]
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
  ): Omit<IPlanningTableRow, 'children'> => {
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

const usePlanningTableRows = () => {
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
  }, [
    subClasses,
    divisions,
    selectedMasterClass,
    selectedClass,
    selectedSubClass,
    selectedDistrict,
    masterClasses,
    classes,
    districts,
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
