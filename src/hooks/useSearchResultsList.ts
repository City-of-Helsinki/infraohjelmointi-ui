import { IClass } from '@/interfaces/classInterfaces';
import { FreeSearchFormObject, IListItem } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  ISearchResults,
  ISearchResultItem,
  ISearchResultListItem,
  ISearchResultsProject,
} from '@/interfaces/searchInterfaces';
import { selectAllClasses } from '@/reducers/classSlice';
import { selectHashTags } from '@/reducers/hashTagsSlice';
import { selectSearchResults, selectSubmittedSearchForm } from '@/reducers/searchSlice';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from './common';

const buildBreadCrumbs = (path: string, classes: Array<IClass>) =>
  path.split('/').map((p) => classes.find((c) => c.id === p)?.name);

const buildSearchResultsList = (
  searchResults: ISearchResults | null,
  classes: Array<IClass>,
  hashTagTermIds: Array<string>,
  allHashTags: Array<IListItem>,
): Array<ISearchResultListItem> => {
  const resultList = [];

  // Since projects only have hashTag id:s we check if the project hashTags that match the
  // search terms hashTags
  const getHashTags = (project: IProject): Array<IListItem> => {
    const projectHashTags = project.hashTags?.filter((h) => hashTagTermIds.includes(h));
    return projectHashTags
      ? allHashTags.filter((h) => projectHashTags.findIndex((ph) => ph === h.id) !== -1)
      : [];
  };

  if (searchResults) {
    for (const [key, value] of Object.entries(searchResults)) {
      if (['classes', 'groups', 'locations'].includes(key)) {
        resultList.push(
          ...value.map((v: ISearchResultItem) => ({
            ...v,
            type: key,
            breadCrumbs: buildBreadCrumbs(v.path, classes),
          })),
        );
      }
      if (key === 'projects') {
        resultList.push(
          ...value.map(({ path, project }: ISearchResultsProject) => {
            return {
              path: path,
              type: key,
              hashTags: getHashTags(project),
              name: project.name,
              id: project.id,
              phase: project.phase?.value,
              breadCrumbs: buildBreadCrumbs(path, classes),
            };
          }),
        );
      }
    }
  }
  return resultList;
};

/**
 * Get a memoized list of all search terms id:s that are hashtags
 */
const useHashTagTermIds = () => {
  const freeSearchParams = useAppSelector(selectSubmittedSearchForm).freeSearchParams;
  const hashTagTermIds = useMemo(
    () =>
      Object.keys(freeSearchParams)
        .filter((k) => k.includes('#'))
        .map((v) => (freeSearchParams as FreeSearchFormObject)[v]?.value),
    [freeSearchParams],
  );
  return { hashTagTermIds };
};

/**
 * Builds a list of ISearchResultListItems to be used for displayed search results in the
 * SearchResultssView.
 *
 * @returns a list of ISearchResultListItems
 */
const useSearchResultsList = () => {
  const classes = useAppSelector(selectAllClasses);
  const searchResults = useAppSelector(selectSearchResults);
  const hashTags = useAppSelector(selectHashTags).hashTags;
  const [searchResultsList, setSearchResultsList] = useState<Array<ISearchResultListItem>>([]);
  const { hashTagTermIds } = useHashTagTermIds();

  useEffect(() => {
    setSearchResultsList(buildSearchResultsList(searchResults, classes, hashTagTermIds, hashTags));
  }, [classes, searchResults, hashTagTermIds]);

  return { searchResultsList };
};

export default useSearchResultsList;
