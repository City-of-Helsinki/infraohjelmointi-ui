import { IError } from '@/interfaces/common';
import { IGroupRequest } from '@/interfaces/groupInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;
export const postGroup = async (request: IGroupRequest) => {
  return axios
    .post(`${REACT_APP_API_URL}/project-groups/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getGroups = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-groups/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};


export const deleteGroup = async (id: string) => {
  return axios
    .delete(`${REACT_APP_API_URL}/project-groups/${id}/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};