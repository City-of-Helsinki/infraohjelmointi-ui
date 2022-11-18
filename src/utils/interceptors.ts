import { IError } from '@/interfaces/common';
import { clearLoading, setLoading } from '@/reducers/loadingSlice';
import { setNotification } from '@/reducers/notificationSlice';
import { AppStore } from '@/store';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

let store: AppStore;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

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
  store.dispatch(setLoading('Ladataan sivua'));
  return request;
};

const handleResponse = (response: AxiosResponse) => {
  store.dispatch(clearLoading());
  return response;
};

const handleError = (error: AxiosError): Promise<IError> => {
  const parsedError: IError = {
    status: error.response?.status,
    message: error.message || 'Unknown error',
  };

  store.dispatch(
    setNotification({
      message: parsedError.message,
      title: `Virhe ${parsedError.status || ''}`,
      type: 'error',
      status: parsedError.status?.toLocaleString(),
    }),
  );

  store.dispatch(clearLoading());

  return Promise.reject(parsedError);
};
