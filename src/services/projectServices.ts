import { IFreeSearchResults } from '@/interfaces/common';
import {
  IProject,
  IProjectPatchRequestObject,
  IProjectPostRequestObject,
  IProjectRequest,
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
import { IUser } from '@/interfaces/userInterfaces';

const { REACT_APP_API_URL } = process.env;

export const getProject = async (id: string): Promise<IProject> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/projects/${id}/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteProject = async (id: string, user: IUser | null): Promise<{ id: string }> => {
  try {
    const request = {
      user: user?.uuid ?? 'no-uuid-available',
    }
    const res = await axios.delete(`${REACT_APP_API_URL}/projects/${id}/`, {data: request});
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};


export const patchProject = async (request: IProjectPatchRequestObject): Promise<IProjectResponse> => {
  try {
    console.log("project: ", request.project)
    // for getting only those properties that have changed values
    const filterUndefinedValues = (obj: IProjectRequest) =>
      Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));

    const requestObject = {
      requestData: request.data,
      valuesForLogging: filterUndefinedValues({
        user: request?.user?.uuid ?? 'no-uuid-available',
        dateTime: new Date().toISOString(),
        operation: 'update',
        projectId: request.id,
        type: 'project',
        endpoint: `${REACT_APP_API_URL}/projects/${request.id}/`,
       /* newValues: {
          category: request.data.category,
          projectClass: request.data.projectClass,
          name: request.data.name,
          phase: request.data.phase,
          constructionPhaseDetail: request.data.constructionPhaseDetail,
          planningStartYear: request.data.planningStartYear,
          constructionEndYear: request.data.constructionEndYear,
          estPlanningStart: request.data.estPlanningStart,
          estPlanningEnd: request.data.estPlanningEnd,
          estConstructionStart: request.data.estConstructionStart,
          estConstructionEnd: request.data.estConstructionEnd,
        },
        oldValues: {
          category: request.project?.category,
          projectClass: request.project?.projectClass,
          name: request.project?.name,
          phase: request.project?.phase,
          constructionPhaseDetail: request.project?.constructionPhaseDetail,
          planningStartYear: request.project?.planningStartYear,
          constructionEndYear: request.project?.constructionEndYear,
          estPlanningStart: request.project?.estPlanningStart,
          estPlanningEnd: request.project?.estPlanningEnd,
          estConstructionStart: request.project?.estConstructionStart,
          estConstructionEnd: request.project?.estConstructionEnd,
        }*/
      }),
    };
    
    console.log("requestObject: ", requestObject)
    const res = await axios.patch(`${REACT_APP_API_URL}/projects/${request.id}/`, requestObject);
    return res;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const postProject = async (request: IProjectPostRequestObject): Promise<IProjectResponse> => {
  try {
   /* const requestData = {
      data: request.data,
      user: request.user?.uuid,
    } */
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
