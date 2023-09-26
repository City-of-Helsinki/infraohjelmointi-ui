import {
  IHashTag,
  IHashTagPatchRequest,
  IHashTagPostRequest,
  IHashTagsResponse,
} from '@/interfaces/hashTagsInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const postHashTag = async (request: IHashTagPostRequest): Promise<IHashTag> => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/project-hashtags/`, request);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getHashTags = async (): Promise<IHashTagsResponse> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-hashtags/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchHashTag = async (request: IHashTagPatchRequest): Promise<IHashTag> => {
  try {
    const res = await axios.patch(
      `${REACT_APP_API_URL}/project-hashtags/${request.id}/`,
      request.data,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
