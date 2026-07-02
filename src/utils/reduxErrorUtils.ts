import { SerializedError } from '@reduxjs/toolkit';
import { IError } from '@/interfaces/common';

interface IRejectedAction {
  payload?: unknown;
  error?: SerializedError;
}

export const toSerializableError = (error: unknown): IError => {
  if (error && typeof error === 'object') {
    const errorObject = error as {
      errors: IError['errors'];
      status?: number;
      data?: unknown;
      message?: string;
      type?: string;
    };

    if (errorObject.data && typeof errorObject.data === 'object') {
      return errorObject.data as IError;
    }

    if (typeof errorObject.data === 'string') {
      return {
        status: errorObject.status,
        message: errorObject.data,
        errors: errorObject.errors,
        type: errorObject.type,
      };
    }

    return {
      status: errorObject.status,
      message: errorObject.message || 'Unknown error',
      errors: errorObject.errors,
      type: errorObject.type,
    };
  }

  if (typeof error === 'string') {
    return { status: undefined, message: error };
  }

  return {
    status: undefined,
    message: 'Unknown error',
  };
};

export const getErrorFromRejectedAction = (action: IRejectedAction): IError => {
  if (action.payload) {
    return toSerializableError(action.payload);
  }

  return {
    status: undefined,
    message: action.error?.message || 'Unknown error',
  };
};
