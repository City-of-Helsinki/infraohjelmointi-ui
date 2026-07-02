import axios from 'axios';
import { axiosBaseQuery } from './infraohjelmointiApi';

jest.mock('axios');

describe('axiosBaseQuery', () => {
  const mockedAxios = axios as jest.MockedFunction<typeof axios>;

  beforeEach(() => {
    mockedAxios.mockReset();
  });

  it('returns response status and response data from AxiosError-like shape', async () => {
    mockedAxios.mockRejectedValue({
      response: {
        status: 400,
        data: { hkrId: ['PW_PROJECT_NOT_FOUND'] },
      },
      message: 'Request failed with status code 400',
    });

    const baseQuery = axiosBaseQuery({ baseUrl: 'https://example.test' });
    const result = await baseQuery({ url: '/projects/1', method: 'patch' }, {} as never, {});

    expect(result).toEqual({
      error: {
        status: 400,
        data: { hkrId: ['PW_PROJECT_NOT_FOUND'] },
      },
    });
  });

  it('falls back to flattened status/data when response object is missing', async () => {
    mockedAxios.mockRejectedValue({
      status: 400,
      data: { hkrId: ['SOME_OTHER_CODE', 'PW_PROJECT_NOT_FOUND'] },
      message: 'Request failed with status code 400',
    });

    const baseQuery = axiosBaseQuery({ baseUrl: 'https://example.test' });
    const result = await baseQuery({ url: '/projects/1', method: 'patch' }, {} as never, {});

    expect(result).toEqual({
      error: {
        status: 400,
        data: { hkrId: ['SOME_OTHER_CODE', 'PW_PROJECT_NOT_FOUND'] },
      },
    });
  });

  it('preserves top-level hkrId payload when data is missing', async () => {
    mockedAxios.mockRejectedValue({
      status: 400,
      hkrId: ['PW_PROJECT_NOT_FOUND'],
      message: 'Request failed with status code 400',
    });

    const baseQuery = axiosBaseQuery({ baseUrl: 'https://example.test' });
    const result = await baseQuery({ url: '/projects/1', method: 'patch' }, {} as never, {});

    expect(result).toEqual({
      error: {
        status: 400,
        data: {
          status: 400,
          hkrId: ['PW_PROJECT_NOT_FOUND'],
          message: 'Request failed with status code 400',
        },
      },
    });
  });

  it('falls back to error message when no structured data is available', async () => {
    mockedAxios.mockRejectedValue({
      message: 'Network Error',
    });

    const baseQuery = axiosBaseQuery({ baseUrl: 'https://example.test' });
    const result = await baseQuery({ url: '/projects/1', method: 'patch' }, {} as never, {});

    expect(result).toEqual({
      error: {
        status: undefined,
        data: 'Network Error',
      },
    });
  });
});
