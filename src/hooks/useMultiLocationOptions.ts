import { IListItem, IOption } from '@/interfaces/common';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';
import _ from 'lodash';
import { listItemsToOption } from '@/utils/common';
import { selectProjectDistricts, selectProjectDivisions, selectProjectSubDivisions } from '@/reducers/listsSlice';

/**
 * Populates the district, division and subDivision lists. Filters the available options of the lists
 * to only include "sibling" locations.
 *
 * @param districts selected districts options
 * @param divisions selected division options
 * @param subDivisions selected subDivision options
 */
const useMultiLocationOptions = (
  districts: Array<IOption>,
  divisions: Array<IOption>,
  subDivisions: Array<IOption>,
) => {
  const allDistricts = useAppSelector(selectProjectDistricts);
  const allDivisions = useAppSelector(selectProjectDivisions);
  const allSubDivisions = useAppSelector(selectProjectSubDivisions);

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

  const getNextSubDivisions = useCallback(() => {
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

  const getNextDistricts = useCallback(() => {
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

  const renameDublicateLocationNames = (locations: IListItem[], allParentLocations: IListItem[]) => {
    const locationNameCounts = locations.reduce((acc: {[key: string]: number}, location) => {
      acc[location.value] = (acc[location.value] || 0) + 1;
      return acc;
    }, {});

    const renamedLocations = locations.map((l) => {
      const isDuplicate = locationNameCounts[l.value] > 1;
      if (isDuplicate) {
        const parentLoaction = allParentLocations.find((parentClass) => parentClass.id === l.parent);
        const newName = `${l.value} (${parentLoaction?.value ?? ''})`;
        return { ...l, value: newName };
      }
      return l;
    });
    return renamedLocations;
  };

  const getRenamedLocations = () => {
    const distrcits = getNextDistricts();
    const renamedDivisions = renameDublicateLocationNames(getNextDivisions(), distrcits);
    const renamedSubDivisions = renameDublicateLocationNames(getNextSubDivisions(), renamedDivisions);
    return {
      districts: listItemsToOption(distrcits),
      divisions: listItemsToOption(renamedDivisions),
      subDivisions: listItemsToOption(renamedSubDivisions)
    }
  }

  return getRenamedLocations();
};

export default useMultiLocationOptions;
