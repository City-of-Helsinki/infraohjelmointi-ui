import { IOption } from '@/interfaces/common';
import { setDistrictList, setDivisionList, setSubDivisionList } from '@/reducers/listsSlice';
import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { useCallback, useEffect, useMemo } from 'react';
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

  const selectedDivisionParent = useMemo(
    () =>
      allDivisions
        .filter((ac) => divisions.findIndex((c) => c.value === ac.id) !== -1)
        .map((c) => c.parent),
    [allDivisions, divisions],
  );

  const selectedSubDivisionParent = useMemo(
    () =>
      allSubDivisions
        .filter((asc) => subDivisions.findIndex((sc) => sc.value === asc.id) !== -1)
        .map((sc) => sc.parent),
    [allSubDivisions, subDivisions],
  );

  const getNextDivisions = useCallback(() => {
    if (!_.isEmpty(subDivisions)) {
      return allDivisions.filter(
        (c) => selectedSubDivisionParent.findIndex((sc) => sc === c.id) !== -1,
      );
    } else if (!_.isEmpty(districts)) {
      return allDivisions.filter((c) => districts.findIndex((mc) => mc.value === c.parent) !== -1);
    } else {
      return allDivisions;
    }
  }, [allDivisions, districts, selectedSubDivisionParent, subDivisions]);

  const getNextSubDivision = useCallback(() => {
    if (!_.isEmpty(divisions)) {
      return allSubDivisions.filter(
        (sc) => divisions.findIndex((fc) => sc.parent === fc.value) !== -1,
      );
    } else if (!_.isEmpty(districts)) {
      return allSubDivisions.filter(
        (sc) => getNextDivisions().findIndex((fc) => sc.parent === fc.id) !== -1,
      );
    } else {
      return allSubDivisions;
    }
  }, [allSubDivisions, districts, divisions, getNextDivisions]);

  const getNextDistrict = useCallback(() => {
    if (!_.isEmpty(divisions)) {
      return allDistricts.filter(
        (mc) => selectedDivisionParent.findIndex((c) => c === mc.id) !== -1,
      );
    } else if (!_.isEmpty(subDivisions)) {
      return allDistricts.filter(
        (mc) => getNextDivisions().findIndex((sc) => sc.parent === mc.id) !== -1,
      );
    } else {
      return allDistricts;
    }
  }, [allDistricts, divisions, getNextDivisions, selectedDivisionParent, subDivisions]);

  useEffect(() => {
    dispatch(setDistrictList(getNextDistrict()));
    dispatch(setDivisionList(getNextDivisions()));
    dispatch(setSubDivisionList(getNextSubDivision()));
  }, [districts, divisions, subDivisions]);
};

export default useMultiLocationList;
