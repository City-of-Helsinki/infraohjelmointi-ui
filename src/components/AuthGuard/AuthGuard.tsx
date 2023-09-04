import { FC, useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getUserThunk, setToken } from '@/reducers/authSlice';
import { useAuth } from 'react-oidc-context';

/**
 * Component to handle authentication stuff
 */
const AuthGuard: FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // Check if user exists and set token to redux and fetch user, token is set for requests in interceptors.ts
  useEffect(() => {
    if (auth.user?.access_token) {
      dispatch(setToken(auth.user.access_token));
      dispatch(getUserThunk(auth.user.profile.sid as string));
    }
  }, [auth]);

  return <></>;
};

export default AuthGuard;
