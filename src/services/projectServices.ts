import { IError, IFreeSearchResults } from '@/interfaces/common';
import {
  IProject,
  IProjectPatchRequestObject,
  IProjectPostRequestObject,
  IProjectsPatchRequestObject,
  IProjectsResponse,
} from '@/interfaces/projectInterfaces';
import {
  IProjectSearchRequest,
  ISearchRequest,
  ISearchResults,
} from '@/interfaces/searchInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getProject = async (id: string): Promise<IProject> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/${id}/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchProject = async (request: IProjectPatchRequestObject): Promise<IProject> => {
  return axios
    .patch(`${REACT_APP_API_URL}/projects/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postProject = async (request: IProjectPostRequestObject): Promise<IProject> => {
  return axios
    .post(`${REACT_APP_API_URL}/projects/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getSearchResults = async (req: ISearchRequest): Promise<ISearchResults> => {
  return axios
    .get(
      req.fullPath ||
        `${REACT_APP_API_URL}/projects/search-results/?${req.params}&limit=${req.limit}&order=${req.order}`,
    )
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchProjects = async (
  request: IProjectsPatchRequestObject,
): Promise<Array<IProject>> => {
  return axios
    .patch(`${REACT_APP_API_URL}/projects/bulk-update/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectsWithParams = async (
  req: IProjectSearchRequest,
): Promise<IProjectsResponse> => {
  const { params, direct, programmed } = req;
  const allParams = `${params}&direct=${direct}${programmed ? '&programmed=true' : ''}`;
  return axios
    .get(`${REACT_APP_API_URL}/projects/?${allParams}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectsWithFreeSearch = async (
  searchWord: string,
): Promise<IFreeSearchResults> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/search-results/?freeSearch=${searchWord}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
