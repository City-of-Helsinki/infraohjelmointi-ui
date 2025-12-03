import {
  ITalpaProjectOpening,
  ITalpaProjectPatchRequestObject,
  ITalpaProjectPostRequestObject,
} from '@/interfaces/talpaInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getTalpaProjectOpeningByProject = async (
  projectId: string,
): Promise<ITalpaProjectOpening> => {
  const res = await axios.get<ITalpaProjectOpening>(
    `${REACT_APP_API_URL}/talpa-project-opening/by-project/${projectId}/`,
  );
  return res.data;
};

export const postTalpaProjectOpening = async (
  request: ITalpaProjectPostRequestObject,
): Promise<ITalpaProjectOpening> => {
  const res = await axios.post<ITalpaProjectOpening>(
    `${REACT_APP_API_URL}/talpa-project-opening/`,
    request.data,
  );
  return res.data;
};

export const patchTalpaProjectOpening = async (
  request: ITalpaProjectPatchRequestObject,
): Promise<ITalpaProjectOpening> => {
  const res = await axios.patch<ITalpaProjectOpening>(
    `${REACT_APP_API_URL}/talpa-project-opening/${request.id}/`,
    request.data,
  );
  return res.data;
};

export const markTalpaProjectAsSent = async (
  talpaProjectId: string,
): Promise<ITalpaProjectOpening> => {
  const res = await axios.post<ITalpaProjectOpening>(
    `${REACT_APP_API_URL}/talpa-project-opening/${talpaProjectId}/send-to-talpa/`,
  );
  return res.data;
};
