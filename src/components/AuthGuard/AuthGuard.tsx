import { FC, useEffect, useState } from 'react';
import { useAuth, hasAuthParams } from 'react-oidc-context';
import { getApiToken } from '@/services/personServices';

/**
 * Component to handle authentication stuff
 */
const AuthGuard: FC = () => {
  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);
  const { isAuthenticated, activeNavigator, isLoading, user } = auth;

  // Check if user token exists and get the API token
  useEffect(() => {
    if (user?.access_token) {
      console.log('auto renew');
      getApiToken();
    }
  }, [user]);

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
