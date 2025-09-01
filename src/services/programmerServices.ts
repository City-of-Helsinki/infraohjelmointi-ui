import axios from 'axios';
import { IProgrammer } from '@/interfaces/programmerInterfaces';

const { REACT_APP_API_URL } = process.env;

export const getProgrammers = async (): Promise<IProgrammer[]> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-programmers/`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};