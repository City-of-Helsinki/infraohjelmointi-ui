import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { memo, useCallback, useState, MouseEvent, FC } from 'react';
import { getProjectsWithFreeSearch } from '@/services/projectServices';
import { useTranslation } from 'react-i18next';
import { arrayHasValue, listItemToOption, objectHasProperty } from '@/utils/common';
import {
  FreeSearchFormItem,
  FreeSearchFormObject,
  IFreeSearchResult,
  IListItem,
} from '@/interfaces/common';
import './styles.css';

type FreeSearchFormListItem = IListItem & { type: string };

interface ISearchState {
  selections: Array<string>;
  searchWord: string;
  resultObject: FreeSearchFormObject;
}

interface IFreeSearchFormProps {
  onFreeSearchSelection: (item: FreeSearchFormItem) => void;
  onFreeSearchRemoval: (item: string) => void;
}

const FreeSearchForm: FC<IFreeSearchFormProps> = ({
  onFreeSearchSelection,
  onFreeSearchRemoval,
}) => {
  const { t } = useTranslation();

  const [searchState, setSearchState] = useState<ISearchState>({
    selections: [],
    searchWord: '',
    resultObject: {},
  });

  const { selections, searchWord, resultObject } = searchState;

  /**
   * Create a list of FreeSearchFormListItems from a IFreeSearchResult
   */
  const freeSearchResultToList = (res: IFreeSearchResult): Array<FreeSearchFormListItem> => {
    const resultList = [];

    res.projects &&
      resultList.push(...res.projects.map((project) => ({ ...project, type: 'project' })));
    res.groups && resultList.push(...res.groups.map((group) => ({ ...group, type: 'group' })));
    res.hashtags &&
      resultList.push(
        ...res.hashtags.map((h) => ({ id: h.id, value: `#${h.value}`, type: 'hashtag' })),
      );
    return resultList;
  };

  /**
   * Create a FreeSearchFormObject from a list of FreeSearchFormItems
   * @returns
   */
  const freeSearchFormItemsToResultObject = (freeSearchFormItems: Array<FreeSearchFormItem>) =>
    freeSearchFormItems.reduce((accumulator, current) => {
      accumulator[current['label'] as unknown as string] = current;
      return accumulator;
    }, {} as FreeSearchFormObject);

  const getSuggestions = useCallback(
    (inputValue: string) =>
      new Promise<{ value: string; label: string }[]>((resolve, reject) => {
        getProjectsWithFreeSearch(inputValue)
          .then((res) => {
            if (res) {
              // Create a combined list of all results and filter already selected values
              const resultList = freeSearchResultToList(res).filter(
                (f) => !arrayHasValue(selections, f.value),
              );

              // Convert the resultList to options for the suggestion dropdown
              const freeSearchFormItemList: Array<FreeSearchFormItem> | [] = resultList
                ? resultList.map((r) => ({ ...listItemToOption(r), type: r.type }))
                : [];

              // This resultObject is needed to be able to add the type, value and name of the selected option,
              // since the callback for selecting an option only returns the displayed value instead of the mapped object.
              if (freeSearchFormItemList.length > 0) {
                setSearchState((current) => ({
                  ...current,
                  resultObject: freeSearchFormItemsToResultObject(freeSearchFormItemList),
                }));
              }

              resolve(freeSearchFormItemList);
            }
            resolve([]);
          })
          .catch(() => reject([]));
      }),
    [selections],
  );

  /**
   * Gets the selectedValue and uses the resultObject to get the id and type for the
   * selectedValue, if it exists in resultObject and isn't already added as a selection
   */
  const handleSubmit = useCallback(
    (value: string) => {
      if (!arrayHasValue(selections, value) && objectHasProperty(resultObject, value)) {
        setSearchState((current) => {
          onFreeSearchSelection(current.resultObject[value]);
          return {
            ...current,
            selections: [...current.selections, value],
            searchWord: '',
          };
        });
      }
    },
    [onFreeSearchSelection, selections, resultObject],
  );

  /**
   * Get the <span>-elements value and remove it from selections-hook when deleting a value
   */
  const onSelectionDelete = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const elementValue = (e.currentTarget as HTMLButtonElement)?.parentElement
        ?.innerText as string;
      onFreeSearchRemoval(elementValue);
      return setSearchState((current) => {
        return {
          ...current,
          selections: current.selections.filter((v) => v !== elementValue),
        };
      });
    },
    [onFreeSearchRemoval],
  );

  const handleSetSearchWord = useCallback(
    (value: string) => setSearchState((current) => ({ ...current, searchWord: value })),
    [],
  );

  return (
    <div className="free-search" data-testid="free-search">
      <SearchInput
        label={t('searchForm.searchWord')}
        helperText={t('searchForm.freeSearchDescription') || ''}
        searchButtonAriaLabel="Search"
        suggestionLabelField="label"
        getSuggestions={getSuggestions}
        value={searchWord}
        onChange={handleSetSearchWord}
        onSubmit={handleSubmit}
      />
      <div className="search-selections">
        {selections.map((w) => (
          <Tag key={w} onDelete={onSelectionDelete}>
            {w}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default memo(FreeSearchForm);
