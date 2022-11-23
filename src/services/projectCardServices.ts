import { IError } from '@/interfaces/common';
import { IProjectCard, IProjectCardRequestObject } from '@/interfaces/projectCardInterfaces';
import axios from 'axios';

export const getProjectCards = async (): Promise<Array<IProjectCard>> => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/projects/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectCard = async (id: string): Promise<IProjectCard> => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/projects/${id}/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postProjectCard = async (request: IProjectCardRequestObject): Promise<void> => {
  return axios
    .post(`${process.env.REACT_APP_API_URL}/projects/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const deleteProjectCard = async (id: string): Promise<void> => {
  return axios
    .delete(`${process.env.REACT_APP_API_URL}/projects/${id}/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchProjectCard = async (request: IProjectCardRequestObject): Promise<void> => {
  return axios
    .patch(`${process.env.REACT_APP_API_URL}/projects/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
