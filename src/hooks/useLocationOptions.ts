import { selectDistricts, selectDivisions, selectSubDivisions } from '@/reducers/locationSlice';
import { classesToOptions } from '@/utils/common';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';

/**
 * Creates lists of districts, divisions and subDivisions. If filtering is used, then all
 * divisions and subDivisions will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
 */
const useLocationOptions = (currentLocation: string | undefined) => {
  const allDistricts = useAppSelector(selectDistricts);
  const allDivisions = useAppSelector(selectDivisions);
  const allSubDivisions = useAppSelector(selectSubDivisions);

  const selectedDistrict = useMemo(
    () => allDistricts && allDistricts.find((mc) => mc.id === currentLocation),
    [currentLocation, allDistricts],
  );

  const selectedDivision = useMemo(
    () => allDivisions && allDivisions.find((c) => c.id === currentLocation),
    [currentLocation, allDivisions],
  );

  const selectedSubDivision = useMemo(
    () => allSubDivisions && allSubDivisions.find((sc) => sc.id === currentLocation),
    [currentLocation, allSubDivisions],
  );

  const getNextDivisions = useCallback(() => {
    if (selectedDistrict) {
      return allDivisions.filter((c) => c.parent === currentLocation);
    } else if (selectedDivision) {
      const divisionParent = allDistricts.find((mc) => mc.id === selectedDivision.parent);
      return allDivisions.filter((c) => c.parent === divisionParent?.id);
    } else if (selectedSubDivision) {
      const subDivisionParent = allDivisions.find((c) => c.id === selectedSubDivision.parent);
      const divisionParent = allDistricts.find((mc) => mc.id === subDivisionParent?.parent);
      return allDivisions.filter((c) => c.parent === divisionParent?.id);
    } else {
      return [];
    }
  }, [
    allDivisions,
    currentLocation,
    allDistricts,
    selectedDivision,
    selectedDistrict,
    selectedSubDivision,
  ]);

  const getNextSubDivisions = useCallback(() => {
    if (selectedDivision) {
      return allSubDivisions.filter((sc) => sc.parent === currentLocation);
    } else if (selectedSubDivision) {
      const subDivisionParent = allDivisions.find((c) => c.id === selectedSubDivision.parent);
      return allSubDivisions.filter((sc) => sc.parent === subDivisionParent?.id);
    } else {
      return [];
    }
  }, [allDivisions, currentLocation, selectedDivision, selectedSubDivision, allSubDivisions]);

  return {
    districts: classesToOptions(allDistricts),
    divisions: classesToOptions(getNextDivisions()),
    subDivisions: classesToOptions(getNextSubDivisions()),
  };
};

export default useLocationOptions;
