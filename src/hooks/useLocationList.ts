import {
  selectDistrictList,
  setDistrictList,
  setDivisionList,
  setSubDivisionList,
} from '@/reducers/listsSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { selectProject } from '@/reducers/projectSlice';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

/**
 * Creates lists of districts, divisions and subDivisions. If filtering is used, then all
 * divisions and subDivisions will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
 */
const useLocationList = (withFilter: boolean) => {
  const projectLocation = useAppSelector(selectProject)?.projectLocation;
  const districts = useAppSelector(selectDistricts);
  const divisions = useAppSelector(selectDivisions);
  const subDivisions = useAppSelector(selectSubDivisions);
  const districtsList = useAppSelector(selectDistrictList);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (districtsList.length === 0) {
      dispatch(setDistrictList(districts));
    }

    if (withFilter) {
      // The parents for each division/subDivision should always be found, but typescript doesn't know that, so we
      // need to add ? (null/undefined checks to each filter)
      if (projectLocation) {
        // If projectLocation is a district, we need to find all divisions that have that district as their parent
        const selectedDistrict = districts.find((d) => d.id === projectLocation);
        if (selectedDistrict) {
          dispatch(setDivisionList(divisions.filter((d) => d.parent === projectLocation)));
        }

        // If projectLocation is a division, we filter the lists to include every division that shares the same district
        const selectedDivision = divisions.find((d) => d.id === projectLocation);
        if (selectedDivision) {
          const divParent = districts.find((d) => d.id === selectedDivision.parent);
          dispatch(setDivisionList(divisions.filter((d) => d.parent === divParent?.id)));
          dispatch(setSubDivisionList(subDivisions.filter((sd) => sd.parent === projectLocation)));
        }

        // If projectLocation is a subDivision, we filter the lists to include every division and subDivision
        // that have the same parents
        const selectedSubDivision = subDivisions.find((sd) => sd.id === projectLocation);
        if (selectedSubDivision) {
          const subDivParent = divisions.find((c) => c.id === selectedSubDivision.parent);
          const divParent = districts.find((d) => d.id === subDivParent?.parent);
          dispatch(setSubDivisionList(subDivisions.filter((sd) => sd.parent === subDivParent?.id)));
          dispatch(setDivisionList(divisions.filter((d) => d.parent === divParent?.id)));
        }
      }
    } else {
      dispatch(setDivisionList(divisions));
      dispatch(setSubDivisionList(subDivisions));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts, divisions, subDivisions, projectLocation]);
};

export default useLocationList;
