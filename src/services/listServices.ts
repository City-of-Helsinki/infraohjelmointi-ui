import { IError } from '@/interfaces/common';
import axios from 'axios';

export const getProjectTypes = async () => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/project-types/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectPhases = async () => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/project-phases/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectAreas = async () => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/project-areas/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
