import { IError } from '@/interfaces/common';
import { INoteRequest } from '@/interfaces/noteInterfaces';
import axios from 'axios';

export const getNotes = async () => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getNotesByProject = async (projectId: string) => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/projects/${projectId}/notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchNote = async (request: INoteRequest) => {
  return axios
    .patch(`${process.env.REACT_APP_API_URL}/notes/${request.id}/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postNote = async (request: INoteRequest) => {
  return axios
    .post(`${process.env.REACT_APP_API_URL}/notes/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const deleteNote = async (id: string) => {
  return axios
    .delete(`${process.env.REACT_APP_API_URL}/notes/${id}`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
