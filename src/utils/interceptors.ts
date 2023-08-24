import { IError, IErrorResponse, INotification } from '@/interfaces/common';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { AppStore } from '@/store';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

let store: AppStore;

// Add urls here that you don't want the interceptor to add a loader to
const urlsToExclueFromLoading = [
  '/project-types/',
  '/project-phases/',
  '/project-areas/',
  '/construction-phase-details/',
  '/project-categories/',
  '/project-risks/',
  '/project-quality-levels/',
  '/planning-phases/',
  '/construction-phases/',
  '/responsible-zones/',
  '/persons/',
  'projects/search-results/?freeSearch',
  '/project-classes',
  '/project-locations',
  '/project-groups',
  '/project-hashtags',
  '/projects/',
];

/**
 * Check if the current url is supposed to add a loader to redux.
 */
const shouldTriggerLoading = (url?: string) =>
  url && !urlsToExclueFromLoading.some((excludedUrl) => url.includes(excludedUrl));

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

const handleRequest = (req: InternalAxiosRequestConfig) => {
  // Check if the url should add a loader to redux
  if (shouldTriggerLoading(req?.url)) {
    store.dispatch(setLoading({ text: 'Loading request', id: req?.url ?? '' }));
  }
  return req;
};

const handleResponse = (res: AxiosResponse) => {
  if (shouldTriggerLoading(res.config.url)) {
    store.dispatch(clearLoading(res.config?.url ?? ''));
  }
  return res;
};

const getErrorNotification = (error: AxiosError): INotification => {
  const url = error.config?.url;

  const parsedError: INotification = {
    status: error.response?.status?.toLocaleString(),
    title: error.status?.toLocaleString() ?? '',
    message: error.message ?? 'Unknown error',
  };

  if (!url) {
    return parsedError;
  }

  if (url.includes('projects') && error.request?.status === 404) {
    parsedError.title = 'projectNotFound';
    parsedError.message = 'projectNotFound';
  }

  return parsedError;
};

const handleError = (error: AxiosError): Promise<IError> => {
  const errorData = error.response?.data as IErrorResponse;

  const parsedError: IError = {
    status: error.response?.status,
    message: error.message || 'Unknown error',
    ...errorData,
  };

  // The handling of backend errors is still in the works, so we're excluding endpoints that we want to handle differently
  if (!error?.request?.responseURL.includes('project-hashtags')) {
    store.dispatch(notifyError(getErrorNotification(error)));
  }

  if (shouldTriggerLoading(error.config?.url)) {
    store.dispatch(clearLoading(error.config?.url ?? ''));
  }

  return Promise.reject(parsedError);
};
