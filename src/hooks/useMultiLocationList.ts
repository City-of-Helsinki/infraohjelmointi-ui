import { IOption } from '@/interfaces/common';
import { setDistrictList, setDivisionList, setSubDivisionList } from '@/reducers/listsSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';
import _ from 'lodash';

/**
 * Populates the district, division and subDivision lists. Filters the available options of the lists
 * to only include "sibling" locations.
 *
 * @param districts selected districts options
 * @param divisions selected division options
 * @param subDivisions selected subDivision options
 */
const useMultiLocationList = (
  districts: Array<IOption>,
  divisions: Array<IOption>,
  subDivisions: Array<IOption>,
) => {
  const allDistricts = useAppSelector(selectDistricts);
  const allDivisions = useAppSelector(selectDivisions);
  const allSubDivisions = useAppSelector(selectSubDivisions);

  const dispatch = useAppDispatch();

  // Populate lists when divisions get populated to redux
  useEffect(() => {
    dispatch(setDistrictList(allDistricts));
    dispatch(setDivisionList(allDivisions));
    dispatch(setSubDivisionList(allSubDivisions));
  }, [allDistricts, allDivisions, allSubDivisions]);

  useEffect(() => {
    const selectedDivisionParent = allDivisions
      .filter((ac) => divisions.findIndex((c) => c.value === ac.id) !== -1)
      .map((c) => c.parent);

    const selectedSubDivisionParent = allSubDivisions
      .filter((asc) => subDivisions.findIndex((sc) => sc.value === asc.id) !== -1)
      .map((sc) => sc.parent);

    const nextdivisions = !_.isEmpty(subDivisions)
      ? allDivisions.filter((c) => selectedSubDivisionParent.findIndex((sc) => sc === c.id) !== -1)
      : !_.isEmpty(districts)
      ? allDivisions.filter((c) => districts.findIndex((mc) => mc.value === c.parent) !== -1)
      : allDivisions;

    const nextsubDivisions = !_.isEmpty(divisions)
      ? allSubDivisions.filter((sc) => divisions.findIndex((fc) => sc.parent === fc.value) !== -1)
      : !_.isEmpty(districts)
      ? allSubDivisions.filter((sc) => nextdivisions.findIndex((fc) => sc.parent === fc.id) !== -1)
      : allSubDivisions;

    const nextdistricts = !_.isEmpty(divisions)
      ? allDistricts.filter((mc) => selectedDivisionParent.findIndex((c) => c === mc.id) !== -1)
      : !_.isEmpty(subDivisions)
      ? allDistricts.filter((mc) => nextdivisions.findIndex((sc) => sc.parent === mc.id) !== -1)
      : allDistricts;

    dispatch(setDistrictList(nextdistricts));
    dispatch(setDivisionList(nextsubDivisions));
    dispatch(setSubDivisionList(nextdivisions));
  }, [districts, divisions, subDivisions]);
};

export default useMultiLocationList;
