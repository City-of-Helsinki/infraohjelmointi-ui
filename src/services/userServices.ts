import { IError } from '@/interfaces/common';
import { IUser } from '@/interfaces/userInterfaces';
import axios from 'axios';

import { User } from 'oidc-client-ts';

const {
  REACT_APP_API_URL,
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

export const getUser = async (): Promise<IUser> => {
  return axios
    .get(`${REACT_APP_API_URL}/who-am-i/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getApiToken = async (): Promise<void> => {
  const tokenEndpoint = await axios
    .get(REACT_APP_OPEN_ID_CONFIG ?? '')
    .then((res) => res.data.token_endpoint)
    .catch((err: IError) => Promise.reject(err));

  const user = getUserFromSessionStorage();

  return axios
    .post(
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
    )
    .then((res) => {
      sessionStorage.setItem(API_TOKEN_KEY, res.data.access_token);
    })
    .catch((err: IError) => {
      sessionStorage.removeItem(API_TOKEN_KEY);
      Promise.reject(err);
    });
};
