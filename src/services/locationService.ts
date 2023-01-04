import { IError } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import axios from 'axios';

export const getLocations = async (): Promise<Array<ILocation>> => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/project-locations/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
