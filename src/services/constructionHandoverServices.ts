import { FinancingRowRequest } from '@/interfaces/constructionHandoverInterfaces';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const postFinancingRow = async (request: FinancingRowRequest) => {
  const res = await axios.post(`${REACT_APP_API_URL}/construction-handover-financings/`, request);
  return res.data;
};

export const patchFinancingRow = async (request: FinancingRowRequest, itemId: string) => {
  const res = await axios.patch(
    `${REACT_APP_API_URL}/construction-handover-financings/${itemId}/`,
    request,
  );
  return res.data;
};

export const deleteFinancingRow = async (itemId: string) => {
  await axios.delete(`${REACT_APP_API_URL}/construction-handover-financings/${itemId}/`);
};