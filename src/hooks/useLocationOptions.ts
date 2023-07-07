import {
  selectPlanningDistricts,
  selectPlanningDivisions,
  selectPlanningSubDivisions,
} from '@/reducers/locationSlice';
import { classesToOptions } from '@/utils/common';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';

/**
 * Creates lists of districts, divisions and subDivisions. If filtering is used, then all
 * divisions and subDivisions will be filtered according to their parent.
 *
 * It only returns districts that are related to the given currentClass.
 */
const useLocationOptions = (
  currentLocation: string | undefined,
  currentClass: string | undefined,
) => {
  const allDistricts = useAppSelector(selectPlanningDistricts);
  const allDivisions = useAppSelector(selectPlanningDivisions);
  const allSubDivisions = useAppSelector(selectPlanningSubDivisions);

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

  const getNextDistricts = useCallback(() => {
    if (currentClass) {
      return allDistricts.filter((d) => currentClass === d.parentClass || d.parentClass === null);
    } else {
      return [];
    }
  }, [allDistricts, currentClass]);

  const getNextDivisions = useCallback(() => {
    if (selectedDistrict) {
      return allDivisions.filter((d) => d.parent === currentLocation);
    } else if (selectedDivision) {
      const divisionParent = allDistricts.find((d) => d.id === selectedDivision.parent);
      return allDivisions.filter((d) => d.parent === divisionParent?.id);
    } else if (selectedSubDivision) {
      const subDivisionParent = allDivisions.find((d) => d.id === selectedSubDivision.parent);
      const divisionParent = allDistricts.find((d) => d.id === subDivisionParent?.parent);
      return allDivisions.filter((d) => d.parent === divisionParent?.id);
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
    districts: classesToOptions(getNextDistricts()),
    divisions: classesToOptions(getNextDivisions()),
    subDivisions: classesToOptions(getNextSubDivisions()),
  };
};

export default useLocationOptions;
