import { FC, useEffect, useState } from 'react';
import { useAuth, hasAuthParams } from 'react-oidc-context';
import { getApiToken } from '@/services/userServices';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getUserThunk, selectUser } from '@/reducers/authSlice';
import { useLocation, useNavigate } from 'react-router';
import { isUserAdmin, isUserOnlyProjectManager, isUserOnlyViewer } from '@/utils/userRoleHelpers';

const INITIAL_PATH = 'initialPath';

const API_TOKEN = sessionStorage.getItem('infraohjelmointi_api_token');

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

  // Check if user token exists and get the API token, set user to redux
  useEffect(() => {
    if (oidcUser?.access_token) {
      const getApiTokenAndUser = async () => {
        // Get API token
        try {
          await getApiToken();
        } catch (e) {
          console.log('Error getting API token: ', e);
        }
        // Get user
        if (!user || (user?.uuid !== oidcUser.profile.sub && !auth.isLoading)) {
          try {
            await dispatch(getUserThunk());
            // Since the redirect from login will bring the url back to REACT_APP_REDIRECT_URI path, we need to
            // return the user to the path that it initially navigated to when opening the app
            const initialPath = localStorage.getItem(INITIAL_PATH);

            if (initialPath) {
              navigate(initialPath);
              localStorage.removeItem(INITIAL_PATH);
            }
          } catch (e) {
            console.log('Error getting user: ', e);
          }
        }
      };

      getApiTokenAndUser();
    }
  }, [oidcUser, API_TOKEN]);

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

  // Redirect user from forbidden paths
  useEffect(() => {
    const { pathname } = location;

    if (!user) {
      return;
    }

    // Redirect to previous url if a non admin tries to access the admin view
    if (pathname.includes('admin') && !isUserAdmin(user)) {
      return navigate(-1);
    }

    // Redirect to planning view if a viewer is trying to access anything but the planning view
    if (!pathname.includes('planning') && isUserOnlyViewer(user)) {
      return navigate('planning');
    }

    if (pathname.includes('project/new') && isUserOnlyProjectManager(user)) {
      return navigate(-1);
    }
  }, [location, user]);

  return <></>;
};

export default AuthGuard;
