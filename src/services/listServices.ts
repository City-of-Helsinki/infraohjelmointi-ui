import { IError } from '@/interfaces/common';
import { IPerson } from '@/interfaces/personsInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getProjectTypes = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-types/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectPhases = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-phases/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectAreas = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-areas/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getConstructionPhaseDetails = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/construction-phase-details/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectCategories = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-categories/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectRisks = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-risks/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getProjectQualityLevels = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-quality-levels/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getPlanningPhases = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/planning-phases/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getConstructionPhases = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/construction-phases/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getResponsibleZones = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/responsible-zones/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getPersons = async (): Promise<Array<IPerson>> => {
  return axios
    .get(`${REACT_APP_API_URL}/persons/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
