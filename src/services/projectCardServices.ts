import { IError } from '@/interfaces/common';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import axios from 'axios';

export const getProjectCards = async (): Promise<Array<IProjectCard>> => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/projects-mock/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
