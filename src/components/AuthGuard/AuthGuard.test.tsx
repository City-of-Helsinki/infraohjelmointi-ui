import mockI18next from '@/mocks/mockI18next';
import mockUser from '@/mocks/mockUser';
import { setupStore } from '@/store';
import { setUser } from '@/reducers/authSlice';

jest.mock('react-i18next', () => mockI18next());

describe.skip('AuthGuard', () => {
  const store = setupStore();

  beforeEach(async () => {
    store.dispatch(setUser(mockUser));
  });

  it('adds a user to store if found', async () => {
    const authState = store.getState().auth;
    const user = store.getState().auth.user;

    expect(authState).toBeDefined();
    expect(user).not.toBeNull();
    expect(user).toEqual(mockUser);
  });
});
