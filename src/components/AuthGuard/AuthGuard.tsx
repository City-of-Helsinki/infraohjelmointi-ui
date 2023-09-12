import { FC, useEffect, useState } from 'react';
import { useAuth, hasAuthParams } from 'react-oidc-context';
import { getApiToken } from '@/services/userServices';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getUserThunk, selectUser } from '@/reducers/authSlice';
import { useLocation, useNavigate } from 'react-router';

const INITIAL_PATH = 'initialPath';

/**
 * Component to handle authentication stuff
 */
const AuthGuard: FC = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);
  const user = useAppSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, activeNavigator, isLoading, user: oidcUser } = auth;

  const token = sessionStorage.getItem('infraohjelmointi_api_token');

  // Check if user token exists and get the API token, set user to redux
  useEffect(() => {
    if (oidcUser?.access_token) {
      getApiToken().then(() => {
        // Get user from our API if the user doesn't exist oidcUser's id doesn't match the current user
        if (!user || (user?.uuid !== oidcUser.profile.sub && !auth.isLoading)) {
          dispatch(getUserThunk()).then(() => {
            // Since the redirect from login will bring the url back to REACT_APP_REDIRECT_URI path, we need to
            // return the user to the path that it initially navigated to when opening the app
            const initialPath = localStorage.getItem(INITIAL_PATH);
            if (initialPath) {
              navigate(initialPath);
              localStorage.removeItem(INITIAL_PATH);
            }
          });
        }
      });
    }
  }, [oidcUser, token]);

  // Check if user exists and sign in
  useEffect(() => {
    if (!hasAuthParams() && !isAuthenticated && !activeNavigator && !isLoading && !hasTriedSignin) {
      const { search, pathname } = location;
      const initialPath = search ? `${pathname}${search}` : pathname;

      localStorage.setItem(INITIAL_PATH, initialPath);

      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [isAuthenticated, activeNavigator, isLoading, hasTriedSignin]);

  return <></>;
};

export default AuthGuard;
