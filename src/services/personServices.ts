import { IError } from '@/interfaces/common';
import { IPerson } from '@/interfaces/userInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getPersons = async (): Promise<Array<IPerson>> => {
  return axios
    .get(`${REACT_APP_API_URL}/persons/`)
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
