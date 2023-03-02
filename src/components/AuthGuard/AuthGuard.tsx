import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getUserThunk, selectUser } from '@/reducers/authSlice';

/**
 * Component to handle authentication stuff
 */
const AuthGuard: FC = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  // Check if user exists
  useEffect(() => {
    if (!user) {
      // Temporarily adding a mock user
      dispatch(getUserThunk());
    }
  }, [user]);

  return <></>;
};

export default AuthGuard;
