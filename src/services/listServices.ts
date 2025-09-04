import { IListItem } from '@/interfaces/common';
import { IProjectDistrict } from '@/interfaces/locationInterfaces';
import { IPerson } from '@/interfaces/personsInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getProjectTypes = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-types/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectPhases = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-phases/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectAreas = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-areas/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getConstructionPhaseDetails = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/construction-phase-details/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectCategories = async (): Promise<IListItem[]> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-categories/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectRisks = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-risks/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProjectQualityLevels = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-quality-levels/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getPlanningPhases = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/planning-phases/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getConstructionPhases = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/construction-phases/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getResponsibleZones = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/responsible-zones/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getPersons = async (): Promise<Array<IPerson>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/persons/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getDistricts = async (): Promise<Array<IProjectDistrict>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-districts/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getBudgetOverrunReasons = async () => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/budget-overrun-reasons/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getProgrammers = async (): Promise<Array<IListItem>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-programmers/`);
    return res.data
      .filter(
        (programmer: { id: string; firstName: string; lastName: string }) =>
          // Filter out empty names and "Ei Valintaa" programmer
          programmer.firstName?.trim() &&
          programmer.lastName?.trim() &&
          !(programmer.firstName === 'Ei' && programmer.lastName === 'Valintaa'),
      )
      .map((programmer: { id: string; firstName: string; lastName: string }) => ({
        id: programmer.id,
        value: `${programmer.firstName} ${programmer.lastName}`.trim(),
      }));
  } catch (e) {
    return Promise.reject(e);
  }
};
