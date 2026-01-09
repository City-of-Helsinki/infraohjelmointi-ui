import { AxiosError } from 'axios';

export const isRequestCanceled = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { code?: string };
  return maybeError.code === AxiosError.ERR_CANCELED;
};
