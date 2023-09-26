import { IClass, IClassPatchRequest } from '@/interfaces/classInterfaces';
import { ICoordinatorRequestParams } from '@/interfaces/common';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getPlanningClasses = async (year: number): Promise<Array<IClass>> => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/project-classes/?year=${year}`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getCoordinationClasses = async (
  req: ICoordinatorRequestParams,
): Promise<Array<IClass>> => {
  try {
    const res = await axios.get(
      `${REACT_APP_API_URL}/project-classes/coordinator/?forcedToFrame=${req.forcedToFrame}&year=${req.year}`,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchCoordinationClass = async (request: IClassPatchRequest) => {
  try {
    const res = await axios.patch(
      `${REACT_APP_API_URL}/project-classes/coordinator/${request.id}/`,
      request.data,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
