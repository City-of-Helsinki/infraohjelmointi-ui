import { FC, useEffect, useState } from 'react';
import { useAuth, hasAuthParams } from 'react-oidc-context';
import { getApiToken } from '@/services/userServices';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getUserThunk, selectUser } from '@/reducers/authSlice';

/**
 * Component to handle authentication stuff
 */
const AuthGuard: FC = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);
  const user = useAppSelector(selectUser);
  const { isAuthenticated, activeNavigator, isLoading, user: oidcUser } = auth;

  // Check if user token exists and get the API token, set user to redux
  useEffect(() => {
    if (oidcUser?.access_token) {
      getApiToken();
      // Get user from our API if the user doesn't exist oidcUser's id doesn't match the current user
      if (!user || user?.uuid !== oidcUser.profile.sub) {
        dispatch(getUserThunk());
      }
    }
  }, [oidcUser]);

  // Check if user exists and sign in
  useEffect(() => {
    if (!hasAuthParams() && !isAuthenticated && !activeNavigator && !isLoading && !hasTriedSignin) {
      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [isAuthenticated, activeNavigator, isLoading, hasTriedSignin]);

  return <></>;
};

export default AuthGuard;
