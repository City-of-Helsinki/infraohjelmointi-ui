import { useCallback } from 'react';
import { IListItem } from '@/interfaces/common';
import { IClass, IProgrammer } from '@/interfaces/classInterfaces';
import { IProjectDistrictOption } from '@/interfaces/locationInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectAllPlanningClasses } from '@/reducers/classSlice';
import {
  selectProjectDistricts,
  selectProjectDivisions,
  selectProjectSubDivisions,
} from '@/reducers/listsSlice';

// Reads backend-computed programmer with hierarchical fallback
export function getBestProgrammerForClass(projectClass: IClass | null): IProgrammer | null {
  if (!projectClass) {
    return null;
  }

  return projectClass.computedDefaultProgrammer || projectClass.defaultProgrammer || null;
}

// IO-411: district-side twin of getBestProgrammerForClass. Returns null when
// the district chain doesn't resolve to any programmer-view class.
export function getBestProgrammerForDistrict(
  district: IProjectDistrictOption | null | undefined,
): IProgrammer | null {
  if (!district) {
    return null;
  }

  return district.computedDefaultProgrammer ?? null;
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
  // IO-411: read all three district levels so the form can resolve a
  // programmer regardless of which level the user picked.
  const projectDistricts = useAppSelector(selectProjectDistricts);
  const projectDivisions = useAppSelector(selectProjectDivisions);
  const projectSubDivisions = useAppSelector(selectProjectSubDivisions);

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

  // Resolve the programmer for any district id, checking the most specific
  // level first (subDivision → division → district). Mirrors the backend's
  // parent-walk so picking a suurpiiri or a sub-level yields the same answer.
  const getProgrammerForDistrict = useCallback(
    (districtId?: string | null): IListItem | null => {
      if (!districtId) {
        return null;
      }

      const option =
        projectSubDivisions?.find((d) => d.id === districtId) ||
        projectDivisions?.find((d) => d.id === districtId) ||
        projectDistricts?.find((d) => d.id === districtId);

      if (!option) {
        return null;
      }

      return programmerToListItem(getBestProgrammerForDistrict(option));
    },
    [projectDistricts, projectDivisions, projectSubDivisions],
  );

  return { getProgrammerForClass, getProgrammerForDistrict };
}
