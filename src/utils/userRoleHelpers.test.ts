import { UserRole } from '@/interfaces/userInterfaces';
import { createMockUserWithAdGroups } from '@/mocks/mockUsers';
import {
  isClassPathInRestrictedScope,
  isClassPathOnRestrictedScopePath,
  isUserOnlyViewer,
  isUserRestrictedProgrammer,
} from './userRoleHelpers';

const ASSIGNED = '8 03 Kadut/B Sillat';

// The restricted group's name is configurable in the API, so only the flag identifies the role
const restrictedUser = createMockUserWithAdGroups([UserRole.VIEWER], {
  is_restricted_programmer: true,
  restricted_class_paths: [ASSIGNED],
});

describe('restricted programmer helpers (IO-756)', () => {
  it('a restricted programmer is not only a viewer, whatever their group names', () => {
    expect(isUserOnlyViewer(restrictedUser)).toBe(false);
    expect(isUserRestrictedProgrammer(restrictedUser)).toBe(true);
  });

  it('only the API flag makes a user restricted', () => {
    expect(isUserRestrictedProgrammer(createMockUserWithAdGroups([UserRole.PLANNER]))).toBe(false);
    expect(isUserRestrictedProgrammer(null)).toBe(false);
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
