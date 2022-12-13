import { IError } from '@/interfaces/common';
import {
  IProjectCard,
  IProjectCardRequestObject,
  IProjectCardsResponse,
} from '@/interfaces/projectCardInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getProjectCards = async (page: number): Promise<IProjectCardsResponse> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects?page=${page}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectCard = async (id: string): Promise<IProjectCard> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postProjectCard = async (request: IProjectCardRequestObject): Promise<void> => {
  return axios
    .post(`${REACT_APP_API_URL}/projects/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const deleteProjectCard = async (id: string): Promise<void> => {
  return axios
    .delete(`${REACT_APP_API_URL}/projects/${id}/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchProjectCard = async (
  request: IProjectCardRequestObject,
): Promise<IProjectCard> => {
  return axios
    .patch(`${REACT_APP_API_URL}/projects/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
