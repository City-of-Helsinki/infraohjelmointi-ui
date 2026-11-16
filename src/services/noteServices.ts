import { ICoordinatorNote } from '@/interfaces/noteInterfaces';
import { IError } from '@/interfaces/common';
import axios from 'axios';

import { API_URL } from '@/config/env';

// Coordinator notes -->
export const getCoordinatorNotes = async () => {
  return axios
    .get(`${API_URL}/coordinator-notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postCoordinatorNoteToProject = async (request: ICoordinatorNote) => {
  return axios
    .post(`${API_URL}/coordinator-notes/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
