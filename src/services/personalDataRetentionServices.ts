import { API_URL } from '@/config/env';
import {
  IPersonalDataRetentionConfirmResponse,
  IPersonalDataRetentionProject,
} from '@/interfaces/personalDataRetentionInterfaces';
import axios from 'axios';

export const getPersonalDataRetentionProjects = async (): Promise<
  Array<IPersonalDataRetentionProject>
> => {
  const res = await axios.get(`${API_URL}/personal-data-retention/`);
  return res.data;
};

export const confirmPersonalDataRetention = async (
  projectId: string,
): Promise<IPersonalDataRetentionConfirmResponse> => {
  const res = await axios.post(`${API_URL}/personal-data-retention/${projectId}/confirm/`);
  return res.data;
};
