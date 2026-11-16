import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import { ICoordinatorRequestParams } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import axios from 'axios';

import { API_URL } from '@/config/env';

export const getPlanningLocations = async (year: number): Promise<Array<ILocation>> => {
  try {
    const res = await axios.get(`${API_URL}/project-locations/?year=${year}`);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getCoordinatorLocations = async (
  req: ICoordinatorRequestParams,
): Promise<Array<ILocation>> => {
  try {
    const res = await axios.get(
      `${API_URL}/project-locations/coordinator/?forcedToFrame=${req.forcedToFrame}&year=${req.year}`,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchCoordinationLocation = async (request: IClassPatchRequest) => {
  try {
    const res = await axios.patch(
      `${API_URL}/project-locations/coordinator/${request.id}/`,
      request.data,
    );
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};
