import { ISapCost } from '@/interfaces/sapCostsInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getSapCurrentYear = async (year: number): Promise<Array<ISapCost>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/sap-current-year-costs/${year}`);
    console.log(res);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};