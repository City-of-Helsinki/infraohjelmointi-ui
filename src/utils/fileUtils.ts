import axios from 'axios';

export const ATTACHMENT_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Formats a file size in bytes to kilobytes.
 * @param size The file size in bytes.
 * @returns The formatted file size in kilobytes, or '-' if the size is invalid.
 */
export const formatSizeToKilobytes = (size?: number | null) => {
  if (size === undefined || size === null || Number.isNaN(size)) {
    return '-';
  }

  return `${Math.round(size / 1024)} kB`;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Resolves a given URL against the API base URL.
 * @param url The URL to resolve.
 * @returns The resolved URL.
 */
function getResolvedUrl(url: string): string {
  if (!API_BASE_URL) {
    return url;
  }

  try {
    return new URL(url, API_BASE_URL).toString();
  } catch {
    return url;
  }
}

/**
 * Downloads a file from the given URL and returns a downloadable URL for it.
 * @param url The URL of the file to download.
 * @returns A promise that resolves to a downloadable URL for the file,
 * or undefined if the download fails.
 */
export async function getDownloadUrl(url: string): Promise<string | undefined> {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return undefined;
  }

  try {
    const response = await axios.get<Blob>(getResolvedUrl(url), {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  } catch {
    // Keep original url if download fails.
    return undefined;
  }
}

/**
 * Downloads each item's file and attaches the resulting object URL to it.
 * @param items The items to hydrate.
 * @param getSourceUrl Returns the API URL of the item's file.
 * @param withObjectUrl Returns the item with the object URL set.
 */
export async function hydrateObjectUrls<T>(
  items: T[],
  getSourceUrl: (item: T) => string,
  withObjectUrl: (item: T, objectUrl: string | undefined) => T,
): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => withObjectUrl(item, await getDownloadUrl(getSourceUrl(item)))),
  );
}

export function revokeObjectUrls(urls: (string | undefined)[]) {
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') {
    return;
  }

  urls.forEach((url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * Creates RTK Query `onQueryStarted` and `onCacheEntryAdded` handlers that revoke the
 * cached data's object URLs when a refetch replaces the data and when the cache entry is removed.
 * @param collectUrls Returns the object URLs contained in the cached data.
 */
export function objectUrlCacheLifecycle<T>(collectUrls: (data: T) => (string | undefined)[]) {
  // Latest cached data per query arg; lifecycle APIs don't expose the cache key.
  const latestData = new Map<string, T>();
  const getKey = (arg: unknown) => JSON.stringify(arg ?? null);

  const onQueryStarted = async (
    arg: unknown,
    {
      getCacheEntry,
      queryFulfilled,
    }: { getCacheEntry: () => { data?: T }; queryFulfilled: Promise<unknown> },
  ) => {
    const previous = getCacheEntry().data;

    try {
      await queryFulfilled;
    } catch {
      return;
    }

    const current = getCacheEntry().data;
    if (current) {
      latestData.set(getKey(arg), current);
    }

    if (previous && previous !== current) {
      const currentUrls = new Set(current ? collectUrls(current) : []);
      revokeObjectUrls(collectUrls(previous).filter((url) => !currentUrls.has(url)));
    }
  };

  const onCacheEntryAdded = async (
    arg: unknown,
    {
      cacheDataLoaded,
      cacheEntryRemoved,
      getCacheEntry,
    }: {
      cacheDataLoaded: Promise<unknown>;
      cacheEntryRemoved: Promise<unknown>;
      getCacheEntry: () => { data?: T };
    },
  ) => {
    const key = getKey(arg);

    try {
      await cacheDataLoaded;
    } catch {
      return;
    }

    const initialData = getCacheEntry().data;

    await cacheEntryRemoved;

    const data = latestData.get(key) ?? initialData;
    latestData.delete(key);

    if (data) {
      revokeObjectUrls(collectUrls(data));
    }
  };

  return { onQueryStarted, onCacheEntryAdded };
}
