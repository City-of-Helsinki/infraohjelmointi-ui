import {
  IHashTag,
  IHashTagPatchRequest,
  IHashTagPostRequest,
  IHashTagsResponse,
} from '@/interfaces/hashTagsInterfaces';
import axios from 'axios';

import { API_URL } from '@/config/env';

export const postHashTag = async (request: IHashTagPostRequest): Promise<IHashTag> => {
  try {
    const res = await axios.post(`${API_URL}/project-hashtags/`, request);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getHashTags = async (): Promise<IHashTagsResponse> => {
  try {
    const res = await axios.get(`${API_URL}/project-hashtags/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchHashTag = async (request: IHashTagPatchRequest): Promise<IHashTag> => {
  try {
    const res = await axios.patch(`${API_URL}/project-hashtags/${request.id}/`, request.data);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
