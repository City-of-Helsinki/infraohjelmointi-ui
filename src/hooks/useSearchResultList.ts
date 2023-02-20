import { IClass } from '@/interfaces/classInterfaces';
import { FreeSearchFormObject, IListItem } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  ISearchResult,
  ISearchResultItem,
  ISearchResultListItem,
  ISearchResultProject,
  ISearchResultType,
} from '@/interfaces/searchInterfaces';
import { selectAllClasses } from '@/reducers/classSlice';
import { selectHashTags } from '@/reducers/hashTagsSlice';
import { selectSearchForm, selectSearchResult } from '@/reducers/searchSlice';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from './common';

// TODO: not sure if locations have a different path...?
const buildBreadCrumbs = (path: string, type: ISearchResultType, classes: Array<IClass>) =>
  type !== 'locations' ? path.split('/').map((p) => classes.find((c) => c.id === p)?.name) : [];

const buildSearchResultList = (
  searchResult: ISearchResult | null,
  classes: Array<IClass>,
  hashTagTermIds: Array<string>,
  hashTags: Array<IListItem>,
): Array<ISearchResultListItem> => {
  const resultList = [];

  // Since projects only have hashTag id:s we check if the project has a hashTag with the given
  // search term and get the display value from hashTags with that index
  const getHashTag = (project: IProject): string => {
    const index = hashTags.findIndex(
      (h) => h.id === project.hashTags?.filter((h) => hashTagTermIds.includes(h))[0],
    );
    return index !== -1 ? `#${hashTags[index]?.value}` : '';
  };

  if (searchResult) {
    for (const [key, value] of Object.entries(searchResult)) {
      if (['classes', 'groups', 'locations'].includes(key)) {
        resultList.push(
          ...value.map((v: ISearchResultItem) => ({
            ...v,
            type: key,
            breadCrumbs: buildBreadCrumbs(
              v.path,
              key as 'classes' | 'groups' | 'locations',
              classes,
            ),
          })),
        );
      }
      if (key === 'projects') {
        resultList.push(
          ...value.map(({ path, project }: ISearchResultProject) => {
            return {
              path: path,
              type: key,
              hashTag: getHashTag(project),
              name: project.name,
              id: project.id,
              phase: project.phase?.value,
              breadCrumbs: buildBreadCrumbs(path, key, classes),
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
  const freeSearchParams = useAppSelector(selectSearchForm).freeSearchParams;
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
 * SearchResultsView.
 *
 * @returns a list of ISearchResultListItems
 */
const useSearchResultList = () => {
  const classes = useAppSelector(selectAllClasses);
  const searchResult = useAppSelector(selectSearchResult);
  const hashTags = useAppSelector(selectHashTags).hashTags;
  const [searchResultList, setSearchResultList] = useState<Array<ISearchResultListItem>>([]);
  const { hashTagTermIds } = useHashTagTermIds();

  useEffect(() => {
    setSearchResultList(buildSearchResultList(searchResult, classes, hashTagTermIds, hashTags));
  }, [classes, searchResult, hashTagTermIds]);

  return { searchResultList };
};

export default useSearchResultList;
