import { UserRole } from '@/interfaces/userInterfaces';
import { createMockUserWithAdGroups } from '@/mocks/mockUsers';
import {
  isClassPathInRestrictedScope,
  isClassPathOnRestrictedScopePath,
  isUserOnlyViewer,
  isUserRestrictedProgrammer,
} from './userRoleHelpers';

const ASSIGNED = '8 03 Kadut/B Sillat';

const restrictedUser = createMockUserWithAdGroups(
  [UserRole.RESTRICTED_PROGRAMMER, UserRole.VIEWER],
  { restricted_class_paths: [ASSIGNED] },
);

describe('restricted programmer helpers (IO-756)', () => {
  it('a restricted programmer with the viewer group is not only a viewer', () => {
    expect(isUserOnlyViewer(restrictedUser)).toBe(false);
    expect(isUserRestrictedProgrammer(restrictedUser)).toBe(true);
  });

  it('coordinators and admins are never restricted', () => {
    for (const role of [UserRole.COORDINATOR, UserRole.ADMIN]) {
      const user = createMockUserWithAdGroups([role, UserRole.RESTRICTED_PROGRAMMER]);
      expect(isUserRestrictedProgrammer(user)).toBe(false);
    }
  });

  it('scope covers the assigned class and its sub classes', () => {
    expect(isClassPathInRestrictedScope(restrictedUser, ASSIGNED)).toBe(true);
    expect(isClassPathInRestrictedScope(restrictedUser, `${ASSIGNED}/Alue 1`)).toBe(true);
    expect(isClassPathInRestrictedScope(restrictedUser, '8 03 Kadut')).toBe(false);
    // A sibling whose name starts with the same text is not in scope
    expect(isClassPathInRestrictedScope(restrictedUser, `${ASSIGNED} ja tunnelit`)).toBe(false);
    expect(isClassPathInRestrictedScope(restrictedUser, undefined)).toBe(false);
  });

  it('the scope path also includes the classes above the assigned class', () => {
    expect(isClassPathOnRestrictedScopePath(restrictedUser, '8 03 Kadut')).toBe(true);
    expect(isClassPathOnRestrictedScopePath(restrictedUser, '8 04 Puistot')).toBe(false);
    expect(isClassPathOnRestrictedScopePath(restrictedUser, '8 03 Kadut/B Lumi')).toBe(false);
  });
});
