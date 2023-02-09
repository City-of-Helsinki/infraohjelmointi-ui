import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { memo, useCallback, useState, MouseEvent } from 'react';
import './styles.css';
import { getProjectsWithFreeSearch } from '@/services/projectServices';
import { listItemToOption } from '@/utils/common';
import './styles.css';
import { IOption } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';

interface ISearchState {
  selections: Array<string>;
  searchWord: string;
  resultObject: any;
}
const FreeSearchForm = () => {
  const { t } = useTranslation();
  const [searchState, setSearchState] = useState<ISearchState>({
    selections: [],
    searchWord: '',
    resultObject: {},
  });

  const { selections, searchWord } = searchState;

  const getSuggestions = (inputValue: string) =>
    new Promise<{ value: string; label: string }[]>((resolve, reject) => {
      getProjectsWithFreeSearch(inputValue)
        .then((res) => {
          const resultList = [];
          if (res) {
            res.projects && resultList.push(...res.projects);
            res.groups && resultList.push(...res.groups);
            res.hashtags &&
              resultList.push(...res.hashtags.map((h) => ({ id: h.id, value: `#${h.value}` })));

            const resultListAsOption: Array<IOption> | [] = resultList
              ? resultList.map((r) => listItemToOption(r))
              : [];

            // TODO: add search results to resultListAsOption to be able to grab the ID when submitting the values
            // if (resultListAsOption.length > 0) {
            //   setSearchState((current) => ({
            //     ...current,
            //     resultObject: Object.fromEntries(
            //       resultListAsOption.map(({ value, label }) => [label, [value]]),
            //     ),
            //   }));
            // }

            resolve(resultListAsOption);
          }
          resolve([]);
        })
        .catch(() => reject([]));
    });

  const handleSubmit = useCallback((value: string) => {
    setSearchState((current) => ({
      ...current,
      selections: [...current.selections, value],
      searchWord: '',
    }));
  }, []);

  /* Get the <span>-elements value and remove it from selections-hook when deleting a value */
  const onSelectionDelete = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const elementValue = (e.currentTarget as HTMLButtonElement)?.parentElement?.innerText;
    return setSearchState((current) => ({
      ...current,
      selections: current.selections.filter((v) => v !== elementValue),
    }));
  }, []);

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
