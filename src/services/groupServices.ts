import { IGroup, IGroupPatchRequestObject, IGroupRequest } from '@/interfaces/groupInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const postGroup = async (request: IGroupRequest): Promise<IGroup> => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/project-groups/`, request);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getPlanningGroups = async (year: number): Promise<Array<IGroup>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-groups/?year=${year}`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getCoordinatorGroups = async (year: number) => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-groups/coordinator/?year=${year}`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteGroup = async (id: string) => {
  try {
    const res = await axios.delete(`${REACT_APP_API_URL}/project-groups/${id}/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchGroup = async (request: IGroupPatchRequestObject): Promise<IGroup> => {
  try {
    const res = await axios.patch(
      `${REACT_APP_API_URL}/project-groups/${request.id}/`,
      request.data,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
