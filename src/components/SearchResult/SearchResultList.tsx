import { useAppSelector } from '@/hooks/common';
import { IClass } from '@/interfaces/classInterfaces';
import {
  ISearchResult,
  ISearchResultItem,
  ISearchResultListItem,
  ISearchResultProject,
  ISearchResultType,
} from '@/interfaces/searchInterfaces';
import { selectAllClasses } from '@/reducers/classSlice';
import { selectIsLoading } from '@/reducers/loadingSlice';
import { selectSearchResult } from '@/reducers/searchSlice';
import { useEffect, useState } from 'react';
import SearchResultCard from './SearchResultCard';
import SearchResultsNotFound from './SearchResultNotFound';
import SearchResultOrderDropdown from './SearchResultOrderDropdown';
import SearchResultPageDropdown from './SearchResultPageDropdown';
import SearchResultPagination from './SearchResultPagination';
import './styles.css';

// const items = ['Project 1', 'Project 2', 'Project 3'];

const buildSearchResultList = (
  searchResult: ISearchResult | null,
  classes: Array<IClass>,
): Array<ISearchResultListItem> => {
  const resultList = [];

  if (searchResult) {
    for (const [key, value] of Object.entries(searchResult)) {
      switch (key) {
        case 'classes':
        case 'groups':
        case 'locations':
          resultList.push(
            ...value.map((v: ISearchResultItem) => ({
              ...v,
              type: key,
              breadCrumbs: buildBreadCrumbs(v.path, key, classes),
            })),
          );
          break;
        case 'projects':
          resultList.push(
            ...value.map(({ path, project }: ISearchResultProject) => ({
              path: path,
              type: key,
              hashTag: '',
              name: project.name,
              id: project.id,
              phase: project.phase?.value,
              breadCrumbs: buildBreadCrumbs(path, key, classes),
            })),
          );
          break;
        default:
          break;
      }
    }
  }

  return resultList;
};

// TODO: not sure if locations have a different path...?
const buildBreadCrumbs = (path: string, type: ISearchResultType, classes: Array<IClass>) =>
  type !== 'locations' ? path.split('/').map((p) => classes.find((c) => c.id === p)?.name) : [];

const SearchResultList = () => {
  const searchResult = useAppSelector(selectSearchResult);
  const isLoading = useAppSelector(selectIsLoading);
  const [searchResultList, setSearchResultList] = useState<Array<ISearchResultListItem>>([]);
  const classes = useAppSelector(selectAllClasses);
  const resultLength = searchResultList.length;

  useEffect(() => {
    setSearchResultList(buildSearchResultList(searchResult, classes));
  }, [classes, searchResult]);

  return (
    <div className="search-result-list-container">
      <div className="result-list-options-container">
        <SearchResultPageDropdown resultLength={resultLength} />
        {resultLength > 0 && <SearchResultOrderDropdown />}
      </div>
      {!isLoading && resultLength > 0 ? (
        <>
          {/* FIXME: temporary use of array index as key because there are duplicate results for some reason */}
          {searchResultList.map((r) => (
            <SearchResultCard key={r.id} {...r} />
          ))}
          <SearchResultPagination />
        </>
      ) : !isLoading ? (
        <SearchResultsNotFound />
      ) : (
        <></>
      )}
    </div>
  );
};

export default SearchResultList;
