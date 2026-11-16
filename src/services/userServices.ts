import axios from 'axios';

import { User } from 'oidc-client-ts';
import { API_ID, API_TOKEN_GRANT_TYPE, AUTHORITY, CLIENT_ID, OPEN_ID_CONFIG } from '@/config/env';

const API_TOKEN_KEY = 'infraohjelmointi_api_token';

const getUserFromSessionStorage = () => {
  const oidcStorage = sessionStorage.getItem(`oidc.user:${AUTHORITY}:${CLIENT_ID}`);

  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
};

const getTokenEndpoint = async (): Promise<string | undefined> => {
  try {
    const res = await axios.get(OPEN_ID_CONFIG ?? '');
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
          grant_type: API_TOKEN_GRANT_TYPE,
          audience: API_ID,
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
