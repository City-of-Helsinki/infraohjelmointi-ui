import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import mockUser from '@/mocks/mockUser';
import { setUser } from '@/reducers/authSlice';
import { RootState } from '@/store';

/**
 * Component to handle authentication stuff
 */
const AuthGuard: FC = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();

  // Check if user exists
  useEffect(() => {
    if (!user) {
      // Temporarily adding a mock user
      dispatch(setUser(mockUser));
    }
  }, [user, dispatch]);

  return <></>;
};

export default AuthGuard;
