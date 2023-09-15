import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import { IError } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getPlanningLocations = async (): Promise<Array<ILocation>> => {
  return axios
    .get(`${REACT_APP_API_URL}/project-locations/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getCoordinatorLocations = async (
  forcedToFrame: boolean,
): Promise<Array<ILocation>> => {
  return axios
    .get(`${REACT_APP_API_URL}/project-locations/coordinator/?forcedToFrame=${forcedToFrame}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchCoordinationLocation = async (request: IClassPatchRequest) => {
  return axios
    .patch(`${REACT_APP_API_URL}/project-locations/coordinator/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
