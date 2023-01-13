import { setDistrictList, setDivisionList, setSubDivisionList } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import _ from 'lodash';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

const useProjectLocationListFilter = () => {
  const project = useAppSelector((state: RootState) => state.project.selectedProject, _.isEqual);
  const districts = useAppSelector((state: RootState) => state.location.districts, _.isEqual);
  const divisions = useAppSelector((state: RootState) => state.location.divisions, _.isEqual);
  const subDivisions = useAppSelector((state: RootState) => state.location.subDivisions, _.isEqual);
  const districtsList = useAppSelector((state: RootState) => state.lists.district, _.isEqual);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const selectedDistrict = project
      ? districts.find((d) => d.id === project.projectLocation)
      : undefined;

    if (districtsList.length <= 0) {
      dispatch(setDistrictList(districts));
    }

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
            districtForDivision ? divisions.filter((d) => d.parent === districtForDivision.id) : [],
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
            districtForDivision ? divisions.filter((d) => d.parent === districtForDivision.id) : [],
          ),
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts, project, divisions, subDivisions]);
};

export default useProjectLocationListFilter;
