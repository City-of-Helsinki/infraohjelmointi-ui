import { IError, IFreeSearchResults } from '@/interfaces/common';
import {
  IProject,
  IProjectGetRequestObject,
  IProjectPatchRequestObject,
  IProjectsResponse,
} from '@/interfaces/projectInterfaces';
import { ISearchRequest, ISearchResults } from '@/interfaces/searchInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getProjects = async (req: IProjectGetRequestObject): Promise<IProjectsResponse> => {
  const year = req.year ? `${req.year}/` : '';
  return axios
    .get(`${REACT_APP_API_URL}/projects/${year}?page=${req.page}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProject = async (id: string): Promise<IProject> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postProject = async (request: IProjectPatchRequestObject): Promise<void> => {
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

export const patchProject = async (request: IProjectPatchRequestObject): Promise<IProject> => {
  return axios
    .patch(`${REACT_APP_API_URL}/projects/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectsWithParams = async (req: ISearchRequest): Promise<ISearchResults> => {
  return axios
    .get(
      req.fullPath ||
        `${REACT_APP_API_URL}/projects/?${req.params}&limit=${req.limit}&order=${req.order}`,
    )
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

// FIXME: this should be remove when search-results gets their own endpoint
export const getPlanningProjectsWithParams = async (
  req: ISearchRequest,
): Promise<IProjectsResponse> => {
  return axios
    .get(
      req.fullPath ||
        `${REACT_APP_API_URL}/projects/planning-view/?${req.params}&limit=${req.limit}&direct=${
          req.direct || false
        }`,
    )
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectsWithFreeSearch = async (
  searchWord: string,
): Promise<IFreeSearchResults> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/?freeSearch=${searchWord}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
