import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { IClass } from '@/interfaces/classInterfaces';
import { IUser, UserRole } from '@/interfaces/userInterfaces';
import { createMockUserWithAdGroups } from '@/mocks/mockUsers';
import useClassOptions from './useClassOptions';
import useRestrictedClassAccess from './useRestrictedClassAccess';

const mockClass = (id: string, path: string, parent: string | null): IClass =>
  ({ id, name: path.split('/').pop(), path, parent }) as IClass;

const master = mockClass('master', '8 03 Kadut', null);
const otherMaster = mockClass('other-master', '8 04 Puistot', null);
const bridges = mockClass('bridges', '8 03 Kadut/B Sillat', 'master');
const snow = mockClass('snow', '8 03 Kadut/B Lumi', 'master');
const bridgesSub = mockClass('bridges-sub', '8 03 Kadut/B Sillat/Alue 1', 'bridges');

const restrictedUser = createMockUserWithAdGroups([UserRole.RESTRICTED_PROGRAMMER], {
  restricted_class_paths: [bridges.path],
});

const renderWithUser = <T,>(hook: () => T, user: IUser) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user }),
      class: () => ({
        planning: {
          allClasses: [master, otherMaster, bridges, snow, bridgesSub],
          masterClasses: [master, otherMaster],
          classes: [bridges, snow],
          subClasses: [bridgesSub],
          otherClassifications: [],
        },
      }),
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(hook, { wrapper }).result.current;
};

const values = (options: Array<{ value: string }>) => options.map((o) => o.value);

describe('useClassOptions for restricted programmers (IO-756)', () => {
  it('only offers the assigned class and the classes on the way to it', () => {
    const options = renderWithUser(() => useClassOptions('master'), restrictedUser);

    expect(values(options.masterClasses)).toEqual(['master']);
    expect(values(options.classes)).toEqual(['bridges']);
  });

  it('offers the sub classes of the assigned class', () => {
    const options = renderWithUser(() => useClassOptions('bridges'), restrictedUser);

    expect(values(options.subClasses)).toEqual(['bridges-sub']);
  });

  it('does not filter the options of a planner', () => {
    const planner = createMockUserWithAdGroups([UserRole.PLANNER]);
    const options = renderWithUser(() => useClassOptions('master'), planner);

    expect(values(options.masterClasses)).toEqual(['master', 'other-master']);
    expect(values(options.classes)).toEqual(['bridges', 'snow']);
  });
});

describe('useRestrictedClassAccess (IO-756)', () => {
  it('allows the assigned class and its sub classes only', () => {
    const { isRestricted, canEditClass } = renderWithUser(
      () => useRestrictedClassAccess(),
      restrictedUser,
    );

    expect(isRestricted).toBe(true);
    expect(canEditClass('bridges')).toBe(true);
    expect(canEditClass('bridges-sub')).toBe(true);
    expect(canEditClass('snow')).toBe(false);
    expect(canEditClass('master')).toBe(false);
    expect(canEditClass(null)).toBe(false);
  });

  it('does not restrict a coordinator who is also in the restricted group', () => {
    const coordinator = createMockUserWithAdGroups(
      [UserRole.COORDINATOR, UserRole.RESTRICTED_PROGRAMMER],
      { restricted_class_paths: [bridges.path] },
    );
    const { isRestricted, canEditClass } = renderWithUser(
      () => useRestrictedClassAccess(),
      coordinator,
    );

    expect(isRestricted).toBe(false);
    expect(canEditClass('snow')).toBe(true);
  });
});
