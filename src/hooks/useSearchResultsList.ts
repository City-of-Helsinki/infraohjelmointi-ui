import { IClass } from '@/interfaces/classInterfaces';
import { ISearchResultListItem, ISearchResultPayloadItem } from '@/interfaces/searchInterfaces';
import { selectAllClasses } from '@/reducers/classSlice';
import { selectSearchResults } from '@/reducers/searchSlice';
import { useEffect, useState } from 'react';
import { useAppSelector } from './common';

const buildBreadCrumbs = (path: string, classes: Array<IClass>): Array<string> =>
  path.split('/').map((p) => classes.find((c) => c.id === p)?.name ?? '');

const buildSearchResultsList = (
  searchResults: Array<ISearchResultPayloadItem>,
  classes: Array<IClass>,
): Array<ISearchResultListItem> => {
  const parsedResults = searchResults.map((r) => ({
    ...r,
    phase: r.phase?.value ?? null,
    breadCrumbs: buildBreadCrumbs(r.path, classes),
  }));

  return parsedResults;
};

/**
 * Builds a list of ISearchResultListItems to be used for displayed search results in the
 * SearchResultsView.
 *
 * @returns a list of ISearchResultListItems
 */
const useSearchResultsList = () => {
  const classes = useAppSelector(selectAllClasses);
  const { results, next, previous, count } = useAppSelector(selectSearchResults);
  const [searchResultsList, setSearchResultsList] = useState<Array<ISearchResultListItem>>([]);

  useEffect(() => {
    if (results) {
      setSearchResultsList(buildSearchResultsList(results, classes));
    }
  }, [classes, results]);

  return { searchResultsList, next, previous, count };
};

export default useSearchResultsList;
