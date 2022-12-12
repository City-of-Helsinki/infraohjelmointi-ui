import { IError } from '@/interfaces/common';
import { IUser } from '@/interfaces/userInterfaces';
import axios from 'axios';

export const getUsers = async (): Promise<Array<IUser>> => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/persons/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

/**
 * TODO: implement this when actual auth is implemented, for now we just fetch the first user from
 * the /persons table and use that as our user
 */
export const getUser = async (id: string) => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/persons/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
