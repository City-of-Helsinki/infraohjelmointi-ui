import { IError } from '@/interfaces/common';
import { IGroupPatchRequestObject, IGroupRequest } from '@/interfaces/groupInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const postGroup = async (request: IGroupRequest) => {
  return axios
    .post(`${REACT_APP_API_URL}/project-groups/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getGroups = async (year: number) => {
  return axios
    .get(`${REACT_APP_API_URL}/project-groups/?year=${year}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const deleteGroup = async (id: string) => {
  return axios
    .delete(`${REACT_APP_API_URL}/project-groups/${id}/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchGroup = async (request: IGroupPatchRequestObject) => {
  return axios
    .patch(`${REACT_APP_API_URL}/project-groups/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
