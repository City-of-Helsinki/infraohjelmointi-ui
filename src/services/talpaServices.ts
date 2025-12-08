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

export interface IDownloadExcelResult {
  blob: Blob;
  fileName: string;
}

const parseFileNameFromContentDisposition = (
  headerValue: string | undefined,
): string | undefined => {
  if (!headerValue) {
    return undefined;
  }

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  const asciiMatch = headerValue.match(/filename="?([^";]+)"?/i);
  const rawFileName = utf8Match?.[1] ?? asciiMatch?.[1];

  if (!rawFileName) {
    return undefined;
  }

  const trimmed = rawFileName.trim().replace(/^['"]|['"]$/g, '');

  try {
    return decodeURIComponent(trimmed);
  } catch (_error) {
    return trimmed;
  }
};

const excelFileNameFallback = 'talpa_avauslomake.xlsx';

export const downloadExcel = async (
  talpaProjectId: string,
): Promise<IDownloadExcelResult | undefined> => {
  try {
    const res = await axios.get<Blob>(
      `${REACT_APP_API_URL}/talpa-project-opening/${talpaProjectId}/download-excel/`,
      {
        responseType: 'blob',
      },
    );

    const fileName = parseFileNameFromContentDisposition(res.headers['content-disposition']);

    return {
      blob: res.data,
      fileName: fileName ?? excelFileNameFallback,
    };
  } catch (error) {
    console.log('Error downloading Talpa Excel file:', error);
  }
};
