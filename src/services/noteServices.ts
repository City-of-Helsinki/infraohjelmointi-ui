import { INote, INoteRequest, ICoordinatorNoteRequest } from '@/interfaces/noteInterfaces';
import { IError } from '@/interfaces/common';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getNotes = async (): Promise<Array<INote>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/notes/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getNotesByProject = async (projectId: string): Promise<Array<INote>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/projects/${projectId}/notes/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchNote = async (request: INoteRequest): Promise<INote> => {
  try {
    const res = await axios.patch(`${REACT_APP_API_URL}/notes/${request.id}/`, request);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const postNote = async (request: INoteRequest): Promise<INote> => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/notes/`, request);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteNote = async (id: string): Promise<INote> => {
  try {
    const res = await axios.delete(`${REACT_APP_API_URL}/notes/${id}`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};


// Coordinator notes -->
export const getCoordinatorNotes = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/coordinator-notes/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const postCoordinatorNoteToProject = async (request: ICoordinatorNoteRequest) => {
  return axios
    .post(`${REACT_APP_API_URL}/coordinator-notes/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
