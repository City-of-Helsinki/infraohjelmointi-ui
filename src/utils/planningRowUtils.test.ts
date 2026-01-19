import { AxiosError } from 'axios';
import { fetchProjectsByRelation } from './planningRowUtils';
import { IProject, IProjectsResponse } from '@/interfaces/projectInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('@/services/projectServices', () => ({
  getProjectsWithParams: jest.fn(),
}));

const mockedGetProjectsWithParams = getProjectsWithParams as jest.MockedFunction<
  typeof getProjectsWithParams
>;

describe('fetchProjectsByRelation', () => {
  it('passes the abort signal through to the service and returns the fetched projects', async () => {
    const mockResponse: IProjectsResponse = {
      results: [{ id: 'project-1' } as IProject],
      count: 1,
      next: null,
    };
    const signal = { aborted: false } as AbortSignal;
    mockedGetProjectsWithParams.mockResolvedValue(mockResponse);

    const projects = await fetchProjectsByRelation('class', '123', false, 2026, false, signal);

    expect(mockedGetProjectsWithParams).toHaveBeenCalledWith(
      {
        params: 'class=123',
        direct: false,
        programmed: true,
        forcedToFrame: false,
        year: 2026,
      },
      false,
      { signal },
    );
    expect(projects).toEqual(mockResponse.results);
  });

  it('rethrows cancellation errors so callers can ignore them', async () => {
    const cancelError = new AxiosError('canceled', AxiosError.ERR_CANCELED);
    mockedGetProjectsWithParams.mockRejectedValue(cancelError);

    await expect(fetchProjectsByRelation('class', '123', false, 2026)).rejects.toBe(cancelError);
  });
});
