import { IClass } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getClasses = async (): Promise<Array<IClass>> => {
  return axios
    .get(`${REACT_APP_API_URL}/project-classes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
