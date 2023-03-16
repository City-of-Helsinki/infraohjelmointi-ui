import { IError } from '@/interfaces/common';
import { clearLoading, setLoading } from '@/reducers/loadingSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { AppStore } from '@/store';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

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

// Add urls here that shouldn't have loading indicator
const handleRequest = (req: InternalAxiosRequestConfig) => {
  // disable loading if using freeSearch, refactor this if more urls are needed
  if (!store.getState().loading.isLoading && !req.url?.includes('projects/?freeSearch')) {
    store.dispatch(setLoading('Loading request'));
  }
  return req;
};

const handleResponse = (res: AxiosResponse) => {
  if (store.getState().loading.isLoading) {
    store.dispatch(clearLoading());
  }
  return res;
};

const handleError = (error: AxiosError): Promise<IError> => {
  const parsedError: IError = {
    status: error.response?.status,
    message: error.message || 'Unknown error',
  };

  store.dispatch(
    notifyError({
      message: parsedError.message,
      title: `${parsedError.status || ''}`,
      status: parsedError.status?.toLocaleString(),
    }),
  );

  store.dispatch(clearLoading());

  return Promise.reject(parsedError);
};
