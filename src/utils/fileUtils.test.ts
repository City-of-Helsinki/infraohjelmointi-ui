import axios from 'axios';
import {
  getDownloadUrl,
  hydrateObjectUrls,
  revokeObjectUrls,
  revokeObjectUrlsOnCacheRemoval,
} from './fileUtils';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fileUtils object urls', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const createObjectURL = jest.fn();
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    createObjectURL.mockReset();
    revokeObjectURL.mockReset();
    mockedAxios.get.mockReset();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  describe('getDownloadUrl', () => {
    it('returns an object url for the downloaded blob', async () => {
      const blob = new Blob(['image']);
      mockedAxios.get.mockResolvedValue({ data: blob });
      createObjectURL.mockReturnValue('blob:image');

      await expect(getDownloadUrl('/files/image.jpg')).resolves.toBe('blob:image');
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/files/image.jpg'), {
        responseType: 'blob',
      });
      expect(createObjectURL).toHaveBeenCalledWith(blob);
    });

    it('returns undefined when download fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(getDownloadUrl('/files/image.jpg')).resolves.toBeUndefined();
    });
  });

  describe('hydrateObjectUrls', () => {
    it('sets an object url for every item using the given callbacks', async () => {
      mockedAxios.get.mockImplementation(async (url: string) => ({ data: new Blob([url]) }));
      createObjectURL.mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');

      const items = [
        { id: '1', url: '/files/first.jpg' },
        { id: '2', url: '/files/second.jpg' },
      ];

      const result = await hydrateObjectUrls<{ id: string; url: string; objectUrl?: string }>(
        items,
        (item) => item.url,
        (item, objectUrl) => ({ ...item, objectUrl }),
      );

      expect(result).toEqual([
        { id: '1', url: '/files/first.jpg', objectUrl: 'blob:first' },
        { id: '2', url: '/files/second.jpg', objectUrl: 'blob:second' },
      ]);
      expect(items[0]).not.toHaveProperty('objectUrl');
    });
  });

  describe('revokeObjectUrls', () => {
    it('revokes every defined url', () => {
      revokeObjectUrls(['blob:first', undefined, 'blob:second']);

      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
    });
  });

  describe('revokeObjectUrlsOnCacheRemoval', () => {
    function createLifecycle<T>(data: T | undefined, cacheDataLoaded = Promise.resolve()) {
      let removeCacheEntry: () => void = () => undefined;
      const cacheEntryRemoved = new Promise<void>((resolve) => {
        removeCacheEntry = resolve;
      });

      return {
        lifecycle: {
          cacheDataLoaded,
          cacheEntryRemoved,
          getCacheEntry: () => ({ data }),
        },
        removeCacheEntry,
      };
    }

    it('revokes collected urls only after the cache entry is removed', async () => {
      const handler = revokeObjectUrlsOnCacheRemoval<{ urls: string[] }>((data) => data.urls);
      const { lifecycle, removeCacheEntry } = createLifecycle({ urls: ['blob:first'] });

      const done = handler(undefined, lifecycle);
      await Promise.resolve();
      expect(revokeObjectURL).not.toHaveBeenCalled();

      removeCacheEntry();
      await done;

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
    });

    it('does nothing when cache data fails to load', async () => {
      const collectUrls = jest.fn();
      const handler = revokeObjectUrlsOnCacheRemoval(collectUrls);
      const { lifecycle } = createLifecycle(undefined, Promise.reject(new Error('Failed')));

      await handler(undefined, lifecycle);

      expect(collectUrls).not.toHaveBeenCalled();
      expect(revokeObjectURL).not.toHaveBeenCalled();
    });
  });
});
