import axios from 'axios';

import { User } from 'oidc-client-ts';

const {
  REACT_APP_API_ID,
  REACT_APP_API_TOKEN_GRANT_TYPE,
  REACT_APP_AUTHORITY,
  REACT_APP_CLIENT_ID,
  REACT_APP_OPEN_ID_CONFIG,
} = process.env;

const API_TOKEN_KEY = 'infraohjelmointi_api_token';

const getUserFromSessionStorage = () => {
  const oidcStorage = sessionStorage.getItem(
    `oidc.user:${REACT_APP_AUTHORITY}:${REACT_APP_CLIENT_ID}`,
  );

  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
};

const getTokenEndpoint = async (): Promise<string | undefined> => {
  try {
    const res = await axios.get(REACT_APP_OPEN_ID_CONFIG ?? '');
    return res.data.token_endpoint;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getApiToken = async (): Promise<void> => {
  const tokenEndpoint = await getTokenEndpoint();

  const user = getUserFromSessionStorage();

  if (tokenEndpoint) {
    try {
      const res = await axios.post(
        tokenEndpoint,
        {
          grant_type: REACT_APP_API_TOKEN_GRANT_TYPE,
          audience: REACT_APP_API_ID,
          permission: '#access',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${user?.access_token}`,
          },
        },
      );

      sessionStorage.setItem(API_TOKEN_KEY, res.data.access_token);
    } catch (e) {
      sessionStorage.removeItem(API_TOKEN_KEY);
      return Promise.reject(e);
    }
  }
};
