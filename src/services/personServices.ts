import { IError } from '@/interfaces/common';
import { IPerson } from '@/interfaces/userInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

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
    .get(`${REACT_APP_API_URL}/user/${id}`)
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

  return axios
    .post(
      tokenEndpoint,
      {
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        audience: 'infraohjelmointi-api-dev',
        permission: '#access',
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
    .then((res) => res.data.access_token)
    .catch((err: IError) => Promise.reject(err));
};
