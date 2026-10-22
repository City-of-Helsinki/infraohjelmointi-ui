import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';
import { selectUser } from '@/reducers/authSlice';
import { isUserRestrictedProgrammer } from '@/utils/userRoleHelpers';

/**
 * Restricted programmers (IO-756) may only edit and create projects in their assigned classes.
 * canEditClass is always true for other users, so callers can use it without a role check.
 * It uses the class ids from /who-am-i, so it is correct before the class lists have loaded.
 */
const useRestrictedClassAccess = () => {
  const user = useAppSelector(selectUser);

  const isRestricted = useMemo(() => isUserRestrictedProgrammer(user), [user]);

  const canEditClass = useCallback(
    (classId?: string | null) =>
      !isRestricted || (!!classId && (user?.restricted_class_ids ?? []).includes(classId)),
    [isRestricted, user],
  );

  return { isRestricted, canEditClass };
};

export default useRestrictedClassAccess;
