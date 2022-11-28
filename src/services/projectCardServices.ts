import { IError } from '@/interfaces/common';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getProjectCards = async (): Promise<Array<IProjectCard>> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectCard = async (id: string): Promise<IProjectCard> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postProjectCard = async (projectCard: IProjectCard): Promise<void> => {
  return axios
    .post(`${REACT_APP_API_URL}/projects/`, projectCard)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const deleteProjectCard = async (id: string): Promise<void> => {
  return axios
    .delete(`${REACT_APP_API_URL}/projects/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
