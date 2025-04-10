import { IFreeSearchResults } from '@/interfaces/common';
import {
  IProject,
  IProjectPatchRequestObject,
  IProjectPostRequestObject,
  IProjectResponse,
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

export const patchProject = async (request: IProjectPatchRequestObject): Promise<IProjectResponse> => {
  try {
    const res = await axios.patch(`${REACT_APP_API_URL}/projects/${request.id}/`, request.data);
    return res;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const postProject = async (request: IProjectPostRequestObject): Promise<IProjectResponse> => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/projects/`, request.data);
    return res;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getSearchResults = async (req: ISearchRequest): Promise<ISearchResults> => {
  try {
    const endOfFullPath = req.fullPath?.split("/projects")[1];
    const url = endOfFullPath
      ? `${REACT_APP_API_URL}/projects${endOfFullPath}`
      : `${REACT_APP_API_URL}/projects/search-results/?${req.params}&limit=${req.limit}&order=${req.order}`;
    const res = await axios.get(url);
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
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchForcedToFrameProjects = async (): Promise<any> => {
  try {
    const res = await axios.patch(`${REACT_APP_API_URL}/projects/bulk-update/forced-to-frame/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getProjectsWithParams = async (
  req: IProjectSearchRequest,
  isCoordinator?: boolean,
): Promise<IProjectsResponse> => {
  const { params, direct, programmed, forcedToFrame, year, fullPath } = req;

  const allParams = `${params}&year=${year}&forcedToFrame=${forcedToFrame}&direct=${direct}${
    programmed ? '&programmed=true' : ''
  }`;

  const url = isCoordinator
    ? `${REACT_APP_API_URL}/projects/coordinator/?${allParams}`
    : `${REACT_APP_API_URL}/projects/?${allParams}`;

  const nextPageUrl = isCoordinator
    ? `${REACT_APP_API_URL}/projects/coordinator/${fullPath?.split("/projects/coordinator/")[1]}`
    : `${REACT_APP_API_URL}/projects/${fullPath?.split("/projects/")[1]}`;

  try {
    const res = await axios.get(fullPath ? nextPageUrl : url);
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
