import { IClass, IClassPatchRequest } from '@/interfaces/classInterfaces';
import { ICoordinatorRequestParams, IError } from '@/interfaces/common';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getPlanningClasses = async (year: number): Promise<Array<IClass>> => {
  return axios
    .get(`${REACT_APP_API_URL}/project-classes/?year=${year}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getCoordinationClasses = async (
  req: ICoordinatorRequestParams,
): Promise<Array<IClass>> => {
  return axios
    .get(
      `${REACT_APP_API_URL}/project-classes/coordinator/?forcedToFrame=${req.forcedToFrame}&year=${req.year}`,
    )
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchCoordinationClass = async (request: IClassPatchRequest) => {
  return axios
    .patch(`${REACT_APP_API_URL}/project-classes/coordinator/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
