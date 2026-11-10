import {
  IPersonalDataRetentionConfirmResponse,
  IPersonalDataRetentionProject,
} from '@/interfaces/personalDataRetentionInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getPersonalDataRetentionProjects = async (): Promise<
  Array<IPersonalDataRetentionProject>
> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/personal-data-retention/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const confirmPersonalDataRetention = async (
  projectId: string,
): Promise<IPersonalDataRetentionConfirmResponse> => {
  try {
    const res = await axios.post(
      `${REACT_APP_API_URL}/personal-data-retention/${projectId}/confirm/`,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
