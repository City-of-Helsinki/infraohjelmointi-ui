import { FC, useEffect, useState } from 'react';
import { useAuth, hasAuthParams } from 'react-oidc-context';
import { getApiToken } from '@/services/userServices';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getUserThunk, selectUser } from '@/reducers/authSlice';
import { useLocation, useNavigate } from 'react-router';
import { isUserAdmin, isUserOnlyProjectManager, isUserOnlyViewer } from '@/utils/userRoleHelpers';

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

  const PAGES = {
    ACCESS_DENIED: 'access-denied',
    AUTH_HELSINKI_RETURN: 'auth/helsinki/return',
    PLANNING: 'planning',
    PROJECT_NEW: 'project/new',
    ADMIN: 'admin',
  }

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
          } catch (e) {
            console.log('Error getting user: ', e);
          }
          return;
        }

        if (user.ad_groups.length === 0) {
          // Do not redirect user to the path where tried to access
          localStorage.removeItem(INITIAL_PATH);

          // No AD groups, no access.
          navigate(PAGES.ACCESS_DENIED);
          return;
        }

        // Since the redirect from login will bring the url back to REACT_APP_REDIRECT_URI path, we need to
        // return the user to the path that it initially navigated to when opening the app
        const initialPath = localStorage.getItem(INITIAL_PATH);

        if (initialPath) {
          navigate(initialPath);
          localStorage.removeItem(INITIAL_PATH);
        }
      };

      getApiTokenAndUser();
    }
  }, [oidcUser, user, auth.isLoading]);

  // Check if user exists and sign in
  useEffect(() => {
    if (!hasAuthParams() && !isAuthenticated && !activeNavigator && !isLoading && !hasTriedSignin) {
      const { search, pathname } = location;
      const initialPath = search ? `${pathname}${search}` : pathname;

      localStorage.setItem(INITIAL_PATH, initialPath);

      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [isAuthenticated, activeNavigator, isLoading, hasTriedSignin, location, auth]);

  // Redirect user from forbidden paths
  useEffect(() => {
    const { pathname } = location;

    if (!user) {
      return;
    }

    if (pathname.includes(PAGES.AUTH_HELSINKI_RETURN) && user) {
      return navigate(PAGES.PLANNING);
    }

    // Redirect to previous url if a non admin tries to access the admin view
    if (pathname.includes(PAGES.ADMIN) && !isUserAdmin(user)) {
      return navigate(-1);
    }

    // Redirect to planning view if a viewer is trying to access anything but the planning view
    if (!pathname.includes(PAGES.PLANNING) && isUserOnlyViewer(user)) {
      return navigate(PAGES.PLANNING);
    }

    // Redirect project managers away from new project form
    if (pathname.includes(PAGES.PROJECT_NEW) && isUserOnlyProjectManager(user)) {
      return navigate(-1);
    }

    // Redirect users without roles to /access-denied
    if (!pathname.includes(PAGES.ACCESS_DENIED) && user.ad_groups.length === 0) {
      return navigate(PAGES.ACCESS_DENIED);
    }

    // Redirect users with roles to planning view if they accidentally opens 'access-denied' page
    if (pathname.includes(PAGES.ACCESS_DENIED) && user.ad_groups.length > 0) {
      return navigate(PAGES.PLANNING);
    }
  }, [location, navigate, user]);

  return <></>;
};

export default AuthGuard;
