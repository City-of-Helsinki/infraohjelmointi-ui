import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';
import { selectUser } from '@/reducers/authSlice';
import { selectAllPlanningClasses } from '@/reducers/classSlice';
import { isClassPathInRestrictedScope, isUserRestrictedProgrammer } from '@/utils/userRoleHelpers';

/**
 * Restricted programmers (IO-756) may only edit and create projects in their assigned classes.
 * canEditClass is always true for other users, so callers can use it without a role check.
 */
const useRestrictedClassAccess = () => {
  const user = useAppSelector(selectUser);
  const allClasses = useAppSelector(selectAllPlanningClasses);

  const isRestricted = useMemo(() => isUserRestrictedProgrammer(user), [user]);

  const canEditClass = useCallback(
    (classId?: string | null) => {
      if (!isRestricted) {
        return true;
      }
      const classPath = allClasses.find((c) => c.id === classId)?.path;
      return isClassPathInRestrictedScope(user, classPath);
    },
    [allClasses, isRestricted, user],
  );

  return { isRestricted, canEditClass };
};

export default useRestrictedClassAccess;
