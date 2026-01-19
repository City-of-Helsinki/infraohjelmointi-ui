import { SerializedError } from '@reduxjs/toolkit';
import { IError } from '@/interfaces/common';

interface IRejectedAction {
  payload?: unknown;
  error?: SerializedError;
}

export const getErrorFromRejectedAction = (action: IRejectedAction): IError => {
  if (action.payload && typeof action.payload === 'object') {
    const payload = action.payload as { status?: number; data?: unknown };
    const data = payload.data as IError | string | undefined;

    if (data && typeof data === 'object') {
      return data;
    }

    return {
      status: payload.status,
      message: typeof data === 'string' ? data : action.error?.message || 'Unknown error',
    };
  }

  return {
    status: undefined,
    message: action.error?.message || 'Unknown error',
  };
};
