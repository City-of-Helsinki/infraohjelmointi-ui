import { IClass } from '@/interfaces/classInterfaces';
import { UserRole } from '@/interfaces/userInterfaces';
import { createMockUserWithAdGroups } from '@/mocks/mockUsers';
import {
  getRestrictedVisibleClassIds,
  isUserOnlyViewer,
  isUserRestrictedProgrammer,
} from './userRoleHelpers';

const mockClass = (id: string, path: string, parent: string | null): IClass =>
  ({ id, name: path.split('/').pop(), path, parent }) as IClass;

const allClasses = [
  mockClass('master', '8 03 Kadut', null),
  mockClass('other-master', '8 04 Puistot', null),
  mockClass('bridges', '8 03 Kadut/B Sillat', 'master'),
  mockClass('snow', '8 03 Kadut/B Lumi', 'master'),
  mockClass('bridges-sub', '8 03 Kadut/B Sillat/Alue 1', 'bridges'),
];

// The restricted group's name is configurable in the API, so only the flag identifies the role
const restrictedUser = createMockUserWithAdGroups([UserRole.VIEWER], {
  is_restricted_programmer: true,
  restricted_class_ids: ['bridges', 'bridges-sub'],
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

  it('visible classes are the editable classes and the classes above them', () => {
    expect([...getRestrictedVisibleClassIds(restrictedUser, allClasses)].sort()).toEqual([
      'bridges',
      'bridges-sub',
      'master',
    ]);
  });

  it('the classes above are found by parent id, whatever the paths say (IO-961)', () => {
    const drifted = [
      mockClass('master', '8 03 Kadut', null),
      // A path that no longer matches the parent links
      mockClass('bridges', '8 04 Puistot/B Sillat', 'master'),
    ];
    const user = { ...restrictedUser, restricted_class_ids: ['bridges'] };

    expect([...getRestrictedVisibleClassIds(user, drifted)].sort()).toEqual(['bridges', 'master']);
  });

  it('keeps the editable ids when their classes are not in the list', () => {
    // e.g. before the classes have loaded
    expect([...getRestrictedVisibleClassIds(restrictedUser, [])].sort()).toEqual([
      'bridges',
      'bridges-sub',
    ]);
  });

  it('shows nothing for a user without classes and survives a parent cycle', () => {
    expect(getRestrictedVisibleClassIds(null, allClasses).size).toBe(0);

    const cyclic = [mockClass('a', 'a', 'b'), mockClass('b', 'b', 'a')];
    const user = { ...restrictedUser, restricted_class_ids: ['a'] };
    expect([...getRestrictedVisibleClassIds(user, cyclic)].sort()).toEqual(['a', 'b']);
  });
});
