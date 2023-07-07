import { IClass } from '@/interfaces/classInterfaces';
import { ISearchResultListItem, ISearchResultPayloadItem } from '@/interfaces/searchInterfaces';
import { selectAllPlanningClasses } from '@/reducers/classSlice';
import { selectSearchResults } from '@/reducers/searchSlice';
import { useEffect, useState } from 'react';
import { useAppSelector } from './common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { selectPlanningDistricts } from '@/reducers/locationSlice';

const buildBreadCrumbs = (
  path: string,
  classes: Array<IClass>,
  districts: Array<ILocation>,
): Array<string> => {
  const searchParamObject = Object.fromEntries(new URLSearchParams(path).entries());
  const ids = Object.values(searchParamObject).map((v) => v);

  const breadCrumbs = ids.map(
    (p) => classes.find((c) => c.id === p)?.name ?? districts.find((d) => d.id === p)?.name ?? '',
  );

  return breadCrumbs;
};

const buildLink = (r: ISearchResultPayloadItem) => {
  // Programmed projects will navigate to planning view and get the ?project= param
  if (r.type === 'projects' && r.programmed) {
    return `/planning/?${r.path}&project=${r.id}`;
  }
  // Non-programmed projects will navigate to project form
  else if (r.type === 'projects') {
    return `/project/${r.id}/basics`;
  }
  // Default will navigate to planning view without the ?project= param
  return `/planning/?${r.path}`;
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
  const classes = useAppSelector(selectAllPlanningClasses);
  const districts = useAppSelector(selectPlanningDistricts);
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
