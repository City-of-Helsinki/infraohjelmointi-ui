import { IFreeSearchResults } from '@/interfaces/common';
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
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/projects/${id}/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteProject = async (id: string): Promise<{ id: string }> => {
  try {
    const res = await axios.delete(`${REACT_APP_API_URL}/projects/${id}/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchProject = async (request: IProjectPatchRequestObject): Promise<IProject> => {
  try {
    const res = await axios.patch(`${REACT_APP_API_URL}/projects/${request.id}/`, request.data);
    return res.data;  
  } catch (e) {
    return Promise.reject(e);
  }
};

export const postProject = async (request: IProjectPostRequestObject): Promise<IProject> => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/projects/`, request.data);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getSearchResults = async (req: ISearchRequest): Promise<ISearchResults> => {
  try {
    const res = await axios.get(
      req.fullPath ||
        `${REACT_APP_API_URL}/projects/search-results/?${req.params}&limit=${req.limit}&order=${req.order}`,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchProjects = async (
  request: IProjectsPatchRequestObject,
): Promise<Array<IProject>> => {
  try {
    const res = await axios.patch(`${REACT_APP_API_URL}/projects/bulk-update/`, request.data);
    console.log("bulk", res.data)
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectsWithParams = async (
  req: IProjectSearchRequest,
  isCoordinator?: boolean,
): Promise<IProjectsResponse> => {
  const { params, direct, programmed, forcedToFrame, year } = req;

  const allParams = `${params}&year=${year}&forcedToFrame=${forcedToFrame}&direct=${direct}${
    programmed ? '&programmed=true' : ''
  }`;

  const url = isCoordinator
    ? `${REACT_APP_API_URL}/projects/coordinator/?${allParams}`
    : `${REACT_APP_API_URL}/projects/?${allParams}`;

  try {
    const res = await axios.get(url);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectsWithFreeSearch = async (
  searchWord: string,
): Promise<IFreeSearchResults> => {
  try {
    const res = await axios.get(
      `${REACT_APP_API_URL}/projects/search-results/?freeSearch=${searchWord}`,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
