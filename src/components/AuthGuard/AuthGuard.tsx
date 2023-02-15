import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getUserThunk, selectUser } from '@/reducers/authSlice';
import _ from 'lodash';

/**
 * Component to handle authentication stuff
 */
const AuthGuard: FC = () => {
  const user = useAppSelector(selectUser, _.isEqual);
  const dispatch = useAppDispatch();

  // Check if user exists
  useEffect(() => {
    if (!user) {
      // Temporarily adding a mock user
      dispatch(getUserThunk());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return <></>;
};

export default AuthGuard;
