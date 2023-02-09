import { IError } from '@/interfaces/common';
import { INoteRequest } from '@/interfaces/noteInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getNotes = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getNotesByProject = async (projectId: string) => {
  return axios
    .get(`${REACT_APP_API_URL}/projects/${projectId}/notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchNote = async (request: INoteRequest) => {
  return axios
    .patch(`${REACT_APP_API_URL}/notes/${request.id}/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postNote = async (request: INoteRequest) => {
  return axios
    .post(`${REACT_APP_API_URL}/notes/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const deleteNote = async (id: string) => {
  return axios
    .delete(`${REACT_APP_API_URL}/notes/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
