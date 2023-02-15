import {
  selectDistrictList,
  setDistrictList,
  setDivisionList,
  setSubDivisionList,
} from '@/reducers/listsSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { selectProject } from '@/reducers/projectSlice';
import _ from 'lodash';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

/**
 * Creates lists of districts, divisions and subDivisions. If filtering is used, then all
 * divisions and subDivisions will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
 */
const useLocationList = (withFilter: boolean) => {
  const project = useAppSelector(selectProject, _.isEqual);
  const districts = useAppSelector(selectDistricts, _.isEqual);
  const divisions = useAppSelector(selectDivisions, _.isEqual);
  const subDivisions = useAppSelector(selectSubDivisions, _.isEqual);
  const districtsList = useAppSelector(selectDistrictList, _.isEqual);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const selectedDistrict = project
      ? districts.find((d) => d.id === project.projectLocation)
      : undefined;

    if (districtsList.length <= 0) {
      dispatch(setDistrictList(districts));
    }

    if (withFilter) {
      const projectLocation = project?.projectLocation;

      if (projectLocation) {
        /* If selected is a district, we need to find all divisions that have that district as their parent */
        if (selectedDistrict) {
          dispatch(setDivisionList(divisions.filter((d) => d.parent === projectLocation)));
        }

        const selectedDivision = divisions.find((d) => d.id === projectLocation);
        /* If selected is a division, we need to find the district and find all divisions for that district */
        if (selectedDivision) {
          const districtForDivision = districts.find((d) => d.id === selectedDivision.parent);

          dispatch(
            setDivisionList(
              districtForDivision
                ? divisions.filter((d) => d.parent === districtForDivision.id)
                : [],
            ),
          );
          dispatch(setSubDivisionList(subDivisions.filter((sd) => sd.parent === projectLocation)));
        }

        const selectedSubDivision = subDivisions.find((sd) => sd.id === projectLocation);
        /* If selected is a subDivision, we need to find the division and district and find which divisions belong to that 
          district and which subDivisions belong to that division */
        if (selectedSubDivision) {
          const divForSubDiv = divisions.find((c) => c.id === selectedSubDivision.parent);
          const districtForDivision = districts.find((d) => d.id === divForSubDiv?.parent);

          dispatch(
            setSubDivisionList(
              divForSubDiv ? subDivisions.filter((sd) => sd.parent === divForSubDiv.id) : [],
            ),
          );
          dispatch(
            setDivisionList(
              districtForDivision
                ? divisions.filter((d) => d.parent === districtForDivision.id)
                : [],
            ),
          );
        }
      }
    } else {
      dispatch(setDivisionList(divisions));
      dispatch(setSubDivisionList(subDivisions));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts, project, divisions, subDivisions]);
};

export default useLocationList;
