import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const axiosBaseQuery =
  ({
    baseUrl,
  }: {
    baseUrl: string;
  }): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const parsedError = axiosError as AxiosError & {
        data?: unknown;
        status?: number;
        hkrId?: unknown;
      };

      const status = parsedError.response?.status ?? parsedError.status;

      let data: unknown = parsedError.response?.data ?? parsedError.data;
      if (data === undefined && parsedError.hkrId !== undefined) {
        data = parsedError;
      }

      if (data === undefined) {
        data = parsedError.message;
      }

      return {
        error: {
          status,
          data,
        },
      };
    }
  };

export const infraohjelmointiApi = createApi({
  reducerPath: 'infraohjelmointiApi',
  baseQuery: axiosBaseQuery({ baseUrl: process.env.REACT_APP_API_URL || '' }),
  tagTypes: ['Notes', 'User', 'Projects', 'ConstructionHandovers'],
  // Endpoints are injected in other files in order to keep them modular
  endpoints: () => ({}),
});
