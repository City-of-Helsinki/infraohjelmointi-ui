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

export const getCoordinatorLocations = async (): Promise<Array<ILocation>> => {
  return axios
    .get(`${REACT_APP_API_URL}/project-locations/coordinator/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};