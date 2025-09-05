import { useCallback } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectProgrammers } from '@/reducers/listsSlice';
import { selectAllPlanningClasses } from '@/reducers/classSlice';
import { getDefaultProgrammerForLocation } from '@/utils/locationProgrammerUtils';
import { IListItem } from '@/interfaces/common';

/**
 * Hook to get the default programmer based on class hierarchy
 * This integrates the class-based programmer logic with the Redux store
 * Uses the class hierarchy (masterClass → class → subClass) to find the most specific
 * class that has a defaultProgrammer set in the admin view
 */
export const useLocationBasedProgrammer = () => {
  const programmers = useAppSelector(selectProgrammers);
  const projectClasses = useAppSelector(selectAllPlanningClasses);

  const getDefaultProgrammerFromClassHierarchy = useCallback(
    (masterClassId?: string, classId?: string, subClassId?: string): IListItem | null => {
      if (!programmers || !projectClasses) {
        return null;
      }

      // Find the class objects by their IDs
      const masterClass = masterClassId
        ? projectClasses.find((c) => c.id === masterClassId) || null
        : null;

      const class_ = classId ? projectClasses.find((c) => c.id === classId) || null : null;

      const subClass = subClassId ? projectClasses.find((c) => c.id === subClassId) || null : null;

      // Use our utility function to get the default programmer based on class hierarchy
      return getDefaultProgrammerForLocation(masterClass, class_, subClass, programmers);
    },
    [programmers, projectClasses],
  );

  return {
    getDefaultProgrammerFromClassHierarchy,
  };
};
