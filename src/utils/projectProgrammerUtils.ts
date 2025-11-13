import { useCallback } from 'react';
import { IListItem } from '@/interfaces/common';
import { IClass, IProgrammer } from '@/interfaces/classInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectAllPlanningClasses } from '@/reducers/classSlice';

// Reads backend-computed programmer with hierarchical fallback
export function getBestProgrammerForClass(projectClass: IClass | null): IProgrammer | null {
  if (!projectClass) {
    return null;
  }

  return projectClass.computedDefaultProgrammer || projectClass.defaultProgrammer || null;
}

// Formats programmer name for form display
export function programmerToListItem(programmer: IProgrammer | null): IListItem | null {
  if (!programmer) {
    return null;
  }

  const firstName = programmer.firstName.trim();
  const lastName = programmer.lastName.trim();
  const fullName = firstName + ' ' + lastName;

  return {
    id: programmer.id,
    value: fullName.replace(/\s+/g, ' ').trim(),
  };
}

// Combines lookup and formatting
export function getProjectProgrammer(projectClass: IClass | null): IListItem | null {
  const programmer = getBestProgrammerForClass(projectClass);
  return programmerToListItem(programmer);
}

// Hook for form usage - pass most specific class ID
export function useProjectProgrammer() {
  const projectClasses = useAppSelector(selectAllPlanningClasses);

  const getProgrammerForClass = useCallback(
    (classId?: string): IListItem | null => {
      if (!classId || !projectClasses?.length) {
        return null;
      }

      const projectClass = projectClasses.find((c) => c.id === classId);

      if (!projectClass) {
        console.warn(`ProjectClass ${classId} not found in Redux store`);
        return null;
      }

      return getProjectProgrammer(projectClass);
    },
    [projectClasses],
  );

  return { getProgrammerForClass };
}
