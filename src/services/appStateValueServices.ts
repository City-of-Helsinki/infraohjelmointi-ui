import axios from 'axios';
import { IAppStateValue } from '@/interfaces/adminInterfaces';

import { API_URL } from '@/config/env';

export const getAllAppStateValues = async (): Promise<IAppStateValue[]> => {
  try {
    const res = await axios.get(`${API_URL}/app-state-value/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const postOrPatchAppStateValue = async (request: {
  name: string;
  value: boolean;
  id?: string;
}): Promise<IAppStateValue> => {
  try {
    // if value already exists we modify the existing one
    if (request.id) {
      const res = await axios.patch(`${API_URL}/app-state-value/${request.id}/`, request);
      return res.data;
      // post a new value if there's no existing value
    } else {
      const res = await axios.post(`${API_URL}/app-state-value/`, request);
      return res.data;
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
