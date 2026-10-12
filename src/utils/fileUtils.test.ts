import axios from 'axios';
import {
  getDownloadUrl,
  hydrateObjectUrls,
  objectUrlCacheLifecycle,
  revokeObjectUrls,
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

  describe('objectUrlCacheLifecycle', () => {
    type Data = { urls: string[] };

    function createCache(initial: Data | undefined, cacheDataLoaded = Promise.resolve()) {
      const cache: { data?: Data } = { data: initial };
      let removeCacheEntry: () => void = () => undefined;
      const cacheEntryRemoved = new Promise<void>((resolve) => {
        removeCacheEntry = resolve;
      });

      return {
        cache,
        lifecycle: {
          cacheDataLoaded,
          cacheEntryRemoved,
          getCacheEntry: () => cache,
        },
        removeCacheEntry,
      };
    }

    async function refetch(
      onQueryStarted: (
        arg: string,
        api: { getCacheEntry: () => { data?: Data }; queryFulfilled: Promise<unknown> },
      ) => Promise<void>,
      cache: { data?: Data },
      arg: string,
      next: Data,
    ) {
      let fulfil: () => void = () => undefined;
      const queryFulfilled = new Promise<void>((resolve) => {
        fulfil = resolve;
      });
      const done = onQueryStarted(arg, { getCacheEntry: () => cache, queryFulfilled });
      cache.data = next;
      fulfil();
      await done;
    }

    it('revokes collected urls only after the cache entry is removed', async () => {
      const { onCacheEntryAdded } = objectUrlCacheLifecycle<Data>((data) => data.urls);
      const { lifecycle, removeCacheEntry } = createCache({ urls: ['blob:first'] });

      const done = onCacheEntryAdded('project', lifecycle);
      await Promise.resolve();
      expect(revokeObjectURL).not.toHaveBeenCalled();

      removeCacheEntry();
      await done;

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
    });

    it('revokes replaced urls on refetch and the latest urls on removal', async () => {
      const { onQueryStarted, onCacheEntryAdded } = objectUrlCacheLifecycle<Data>(
        (data) => data.urls,
      );
      const { cache, lifecycle, removeCacheEntry } = createCache({
        urls: ['blob:kept', 'blob:old'],
      });

      const done = onCacheEntryAdded('project', lifecycle);
      await Promise.resolve();

      await refetch(onQueryStarted, cache, 'project', { urls: ['blob:kept', 'blob:new'] });

      expect(revokeObjectURL).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:old');

      revokeObjectURL.mockClear();
      removeCacheEntry();
      await done;

      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:kept');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:new');
    });

    it('keeps previous urls when the refetch fails', async () => {
      const { onQueryStarted } = objectUrlCacheLifecycle<Data>((data) => data.urls);
      const queryFulfilled = Promise.reject(new Error('Failed'));

      await onQueryStarted('project', {
        getCacheEntry: () => ({ data: { urls: ['blob:first'] } }),
        queryFulfilled,
      });

      expect(revokeObjectURL).not.toHaveBeenCalled();
    });

    it('does nothing when cache data fails to load', async () => {
      const collectUrls = jest.fn();
      const { onCacheEntryAdded } = objectUrlCacheLifecycle<Data>(collectUrls);
      const { lifecycle } = createCache(undefined, Promise.reject(new Error('Failed')));

      await onCacheEntryAdded('project', lifecycle);

      expect(collectUrls).not.toHaveBeenCalled();
      expect(revokeObjectURL).not.toHaveBeenCalled();
    });
  });
});
