import { IClass, IClassPatchRequest } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getPlanningClasses = async (): Promise<Array<IClass>> => {
  return axios
    .get(`${REACT_APP_API_URL}/project-classes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getCoordinationClasses = async (forcedToFrame: boolean): Promise<Array<IClass>> => {
  return axios
    .get(`${REACT_APP_API_URL}/project-classes/coordinator/?forcedToFrame=${forcedToFrame}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchCoordinationClass = async (request: IClassPatchRequest) => {
  return axios
    .patch(`${REACT_APP_API_URL}/project-classes/coordinator/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
