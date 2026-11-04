import { ISapCost } from '@/interfaces/sapCostsInterfaces';
import axios from 'axios';

import { API_URL } from '@/config/env';

export const getSapCosts = async (year: number): Promise<Array<ISapCost>> => {
  try {
    const res = await axios.get(`${API_URL}/sap-costs/${year}/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getSapCurrentYear = async (year: number): Promise<Array<ISapCost>> => {
  try {
    const res = await axios.get(`${API_URL}/sap-current-year-costs/${year}`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
