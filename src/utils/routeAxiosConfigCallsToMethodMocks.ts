import axios, { AxiosRequestConfig } from 'axios';
import type { Mocked, MockedFunction } from 'vitest';

export const routeAxiosConfigCallsToMethodMocks = (mockedAxios: Mocked<typeof axios>) => {
  const mockedAxiosFn = mockedAxios as unknown as MockedFunction<typeof axios>;

  mockedAxiosFn.mockImplementation(async (...args: unknown[]) => {
    const config = (
      typeof args[0] === 'object' && args[0] !== null ? args[0] : args[1]
    ) as AxiosRequestConfig;

    const method = (config?.method ?? 'GET').toUpperCase();
    const url = config?.url ?? '';

    switch (method) {
      case 'POST':
        return mockedAxios.post(url, config?.data, {
          params: config?.params,
          headers: config?.headers,
        });
      case 'PUT':
        return mockedAxios.put(url, config?.data, {
          params: config?.params,
          headers: config?.headers,
        });
      case 'PATCH':
        return mockedAxios.patch(url, config?.data, {
          params: config?.params,
          headers: config?.headers,
        });
      case 'DELETE':
        return mockedAxios.delete(url, {
          data: config?.data,
          params: config?.params,
          headers: config?.headers,
        });
      default:
        return mockedAxios.get(url, {
          params: config?.params,
          headers: config?.headers,
        });
    }
  });
};
