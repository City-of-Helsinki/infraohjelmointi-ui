import { IError } from '@/interfaces/common';
import axios from 'axios';

export const getNotes = async () => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getNotesByProjectCard = async (projectId: string) => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/projects/${projectId}/notes`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
