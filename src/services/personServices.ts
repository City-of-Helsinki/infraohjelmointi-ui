import { IError } from '@/interfaces/common';
import { IPerson } from '@/interfaces/userInterfaces';
import axios from 'axios';

import { User } from 'oidc-client-ts';

const { REACT_APP_API_URL } = process.env;

const API_TOKEN_KEY = 'infraohjelmointi_api_token';

const authority = 'https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus';
const client_id = 'infraohjelmointi-ui-dev';

const getUserFromSessionStorage = () => {
  const oidcStorage = sessionStorage.getItem(`oidc.user:${authority}:${client_id}`);

  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
};

export const getPersons = async (): Promise<Array<IPerson>> => {
  return axios
    .get(`${REACT_APP_API_URL}/user/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

/**
 * TODO: implement this when actual auth is implemented, for now we just fetch the first user from
 * the /persons table and use that as our user
 */
export const getPerson = async (id: string) => {
  return axios
    .get(`${REACT_APP_API_URL}/persons/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getUser = async (id: string): Promise<Array<IPerson>> => {
  return axios
    .get(`${REACT_APP_API_URL}/persons/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getApiToken = async () => {
  const tokenEndpoint = await axios
    .get(
      'https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus/.well-known/openid-configuration',
    )
    .then((res) => res.data.token_endpoint)
    .catch((err: IError) => Promise.reject(err));

  const user = getUserFromSessionStorage();

  return axios
    .post(
      tokenEndpoint,
      {
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        audience: 'infraohjelmointi-api-dev',
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
