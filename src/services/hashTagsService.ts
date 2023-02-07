import { IError } from '@/interfaces/common';
import axios from 'axios';

export const postHashTag = async (request: { value: string }) => {
  return axios
    .post(`${process.env.REACT_APP_API_URL}/project-hashtags/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
export const getHashTags = async () => {
  return axios
    .get(`${process.env.REACT_APP_API_URL}/project-hashtags/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
