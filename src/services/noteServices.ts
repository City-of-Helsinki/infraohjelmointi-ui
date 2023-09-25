import { INote, INoteRequest } from '@/interfaces/noteInterfaces';
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
