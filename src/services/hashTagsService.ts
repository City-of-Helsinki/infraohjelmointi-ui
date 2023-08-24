import { IError } from '@/interfaces/common';
import { IHashTagPatchRequest, IHashTagPostRequest } from '@/interfaces/hashTagsInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const postHashTag = async (request: IHashTagPostRequest) => {
  return axios
    .post(`${REACT_APP_API_URL}/project-hashtags/`, request)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const getHashTags = async () => {
  return axios
    .get(`${REACT_APP_API_URL}/project-hashtags/`)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};

export const patchHashTag = async (request: IHashTagPatchRequest) => {
  return axios
    .patch(`${REACT_APP_API_URL}/project-hashtags/${request.id}/`, request.data)
    .then((res) => res.data)
    .catch((err: IError) => Promise.reject(err));
};
