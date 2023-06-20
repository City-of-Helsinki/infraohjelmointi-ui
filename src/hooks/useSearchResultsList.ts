import { IClass } from '@/interfaces/classInterfaces';
import { ISearchResultListItem, ISearchResultPayloadItem } from '@/interfaces/searchInterfaces';
import { selectAllClasses } from '@/reducers/classSlice';
import { selectSearchResults } from '@/reducers/searchSlice';
import { useEffect, useState } from 'react';
import { useAppSelector } from './common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { selectDistricts } from '@/reducers/locationSlice';

const buildBreadCrumbs = (
  path: string,
  classes: Array<IClass>,
  districts: Array<ILocation>,
): Array<string> =>
  path
    .split('/')
    .map(
      (p) => classes.find((c) => c.id === p)?.name ?? districts.find((d) => d.id === p)?.name ?? '',
    );

const buildLink = (r: ISearchResultPayloadItem) => {
  if (r.type === 'projects') {
    // if programmed is false return `/project/${r.id}/basics`
    return `/planning/${r.path}/?project=${r.id}`;
  }

  return `/planning/${r.path}`;
};
const buildSearchResultsList = (
  searchResults: Array<ISearchResultPayloadItem>,
  classes: Array<IClass>,
  districts: Array<ILocation>,
): Array<ISearchResultListItem> => {
  const parsedResults = searchResults.map((r) => {
    return {
      ...r,
      phase: r.phase?.value ?? null,
      breadCrumbs: buildBreadCrumbs(r.path, classes, districts),
      link: buildLink(r),
    };
  });

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
  const districts = useAppSelector(selectDistricts);
  const { results, next, previous, count } = useAppSelector(selectSearchResults);
  const [searchResultsList, setSearchResultsList] = useState<Array<ISearchResultListItem>>([]);

  useEffect(() => {
    if (results) {
      setSearchResultsList(buildSearchResultsList(results, classes, districts));
    }
  }, [classes, results]);

  return { searchResultsList, next, previous, count };
};

export default useSearchResultsList;
