import { IError, IFreeSearchResults } from '@/interfaces/common';
import {
  IProject,
  IProjectPatchRequestObject,
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
    .get(`${REACT_APP_API_URL}/projects/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchProject = async (request: IProjectPatchRequestObject): Promise<IProject> => {
  return axios
    .patch(`${REACT_APP_API_URL}/projects/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getSearchResults = async (req: ISearchRequest): Promise<ISearchResults> => {
  return axios
    .get(
      req.fullPath ||
        `${REACT_APP_API_URL}/projects/?${req.params}&limit=${req.limit}&order=${req.order}`,
    )
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectsWithParams = async (
  req: IProjectSearchRequest,
): Promise<IProjectsResponse> => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/planning-view/?${req.params}&direct=${req.direct}`)
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
