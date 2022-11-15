import { IError } from '@/interfaces/common';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Intercepts axios requests and responses before they are handled by the services.
 *
 * This interceptor is imported directly into index.tsx.
 * This could also be done by assigning a customAxios variable, but that will interfere with the
 * testing of axios requests.
 */
// Request interceptor
axios.interceptors.request.use(
  (request) => handleRequest(request),
  (error) => handleError(error),
);

// Response interceptor
axios.interceptors.response.use(
  (response) => handleResponse(response),
  (error) => handleError(error),
);

const handleRequest = (request: AxiosRequestConfig) => {
  // Check if auth/token found here
  return request;
};

const handleResponse = (response: AxiosResponse) => response;

const handleError = (error: AxiosError): Promise<IError> => {
  // Add error notification
  const parsedError: IError = {
    status: error.response?.status,
    message: error.message || 'Unknown error',
  };
  return Promise.reject(parsedError);
};
