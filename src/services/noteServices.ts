import { ICoordinatorNote } from '@/interfaces/noteInterfaces';
import { IError } from '@/interfaces/common';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

// Coordinator notes -->
export const getCoordinatorNotes = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/coordinator-notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postCoordinatorNoteToProject = async (request: ICoordinatorNote) => {
  return axios
    .post(`${REACT_APP_API_URL}/coordinator-notes/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
