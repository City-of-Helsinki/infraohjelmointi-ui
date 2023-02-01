import { IError } from '@/interfaces/common';
import { IProject, IProjectRequestObject, IProjectsResponse } from '@/interfaces/projectInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getProjects = async (page: number): Promise<IProjectsResponse> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects?page=${page}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProject = async (id: string): Promise<IProject> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postProject = async (request: IProjectRequestObject): Promise<void> => {
  return axios
    .post(`${REACT_APP_API_URL}/projects/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const deleteProject = async (id: string): Promise<void> => {
  return axios
    .delete(`${REACT_APP_API_URL}/projects/${id}/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchProject = async (request: IProjectRequestObject): Promise<IProject> => {
  return axios
    .patch(`${REACT_APP_API_URL}/projects/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectsWithParams = async (params: string): Promise<Array<IProject>> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/?${params}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectsWithFreeSearch = async (searchWord: string): Promise<Array<IProject>> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/?freeSearch=${searchWord}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
