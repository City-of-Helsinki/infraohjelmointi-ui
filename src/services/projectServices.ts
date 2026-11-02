import { IAppStateValue } from '@/interfaces/adminInterfaces';
import { IFreeSearchResults } from '@/interfaces/common';
import {
  IProject,
  IProjectsPatchRequestObject,
  IProjectsResponse,
} from '@/interfaces/projectInterfaces';
import {
  IProjectSearchRequest,
  ISearchRequest,
  ISearchResults,
} from '@/interfaces/searchInterfaces';
import axios from 'axios';

import { API_URL } from '@/config/env';

export const getSearchResults = async (req: ISearchRequest): Promise<ISearchResults> => {
  try {
    const endOfFullPath = req.fullPath?.split('/projects')[1];
    const url = endOfFullPath
      ? `${API_URL}/projects${endOfFullPath}`
      : `${API_URL}/projects/search-results/?${req.params}&limit=${req.limit}&order=${req.order}`;
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
    const res = await axios.patch(`${API_URL}/projects/bulk-update/`, request.data);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchForcedToFrameProjects = async (): Promise<IAppStateValue> => {
  try {
    const res = await axios.patch(`${API_URL}/projects/bulk-update/forced-to-frame/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectsWithParams = async (
  req: IProjectSearchRequest,
  isCoordinator?: boolean,
  options?: { signal?: AbortSignal },
): Promise<IProjectsResponse> => {
  const { params, direct, programmed, forcedToFrame, year, fullPath } = req;

  const allParams = `${params}&year=${year}&forcedToFrame=${forcedToFrame}&direct=${direct}${
    programmed ? '&programmed=true' : ''
  }`;

  const url = isCoordinator
    ? `${API_URL}/projects/coordinator/?${allParams}`
    : `${API_URL}/projects/?${allParams}`;

  const nextPageUrl = isCoordinator
    ? `${API_URL}/projects/coordinator/${fullPath?.split('/projects/coordinator/')[1]}`
    : `${API_URL}/projects/${fullPath?.split('/projects/')[1]}`;

  try {
    const axiosConfig = options?.signal ? { signal: options.signal } : undefined;
    const res = await axios.get(fullPath ? nextPageUrl : url, axiosConfig);
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
      `${API_URL}/projects/search-results/?freeSearch=${encodeURIComponent(searchWord)}`,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
