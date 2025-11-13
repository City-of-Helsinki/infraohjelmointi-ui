import { Tag } from 'hds-react';
import { SearchInput } from 'hds-react';
import { memo, useCallback, useState, MouseEvent } from 'react';
import { getProjectsWithFreeSearch } from '@/services/projectServices';
import { useTranslation } from 'react-i18next';
import { arrayHasValue, listItemToOption } from '@/utils/common';
import { HookFormControlType, ISearchForm } from '@/interfaces/formInterfaces';
import { Control, Controller, FieldValues, UseFormGetValues } from 'react-hook-form';
import {
  FreeSearchFormItem,
  FreeSearchFormObject,
  IFreeSearchResults,
  IListItem,
} from '@/interfaces/common';
import _ from 'lodash';
import './styles.css';

type FreeSearchFormListItem = IListItem & { type: string };

/**
 * Create a list of FreeSearchFormListItems from a IFreeSearchResults
 */
const freeSearchResultsToList = (res: IFreeSearchResults): Array<FreeSearchFormListItem> => {
  // concatenate three different arrays
  return Object.entries(res || {}).flatMap(([key, value]) => {
    const prefix = key === 'hashtags' ? '#' : '';
    return value.map((v: IListItem) => ({
      id: v.id,
      value: `${prefix}${v.value}`,
      type: key,
    }));
  });
};

interface ISearchState {
  searchWord: string;
  resultObject: FreeSearchFormObject;
}

let searchWordDuplicates: Record<string, FreeSearchFormListItem[]> = {};

const FreeSearchForm = ({
  control,
  getValues,
}: {
  control: HookFormControlType;
  getValues: UseFormGetValues<ISearchForm>;
}) => {
  const { t } = useTranslation();

  const [searchState, setSearchState] = useState<ISearchState>({
    searchWord: '',
    resultObject: {},
  });

  const { searchWord, resultObject } = searchState;

  const getSuggestions = useCallback(
    async (inputValue: string) => {
      try {
        const res = await getProjectsWithFreeSearch(inputValue);

        const formValue = getValues('freeSearchParams');

        // Create a combined list of all results and filter already added values
        const resultListWithDuplicates = freeSearchResultsToList(res || {}).filter(
          (f) => !arrayHasValue(Object.keys(formValue), f.value),
        );

        // reset duplicates
        searchWordDuplicates = {};

        const resultList = Object.values(
          resultListWithDuplicates.reduce((accumulator, current) => {
            // catch duplicates
            if (accumulator[current.value]) {
              searchWordDuplicates[current.value] = [
                ...(searchWordDuplicates[current.value] ?? []),
                current,
              ];
            } else {
              // kep only one copy of each element
              accumulator[current.value] = current;
            }
            return accumulator;
          }, {} as Record<string, FreeSearchFormListItem>),
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
            resultObject: _.keyBy(freeSearchFormItemList, 'label'),
          }));
        }

        return freeSearchFormItemList || [];
      } catch (e) {
        console.log('Error getting free search results: ', e);
        return [];
      }
    },

    [getValues],
  );

  /**
   * Gets the selectedValue and uses the resultObject to get the id and type for the
   * selectedValue, if it exists in resultObject and isn't already an added value
   */
  const handleSubmit = useCallback(
    (value: string, onChange: (...event: unknown[]) => void) => {
      const formValue = getValues('freeSearchParams');
      if (!arrayHasValue(Object.keys(formValue), value) && _.has(resultObject, value)) {
        const nextChange = {
          ...formValue,
          [resultObject[value].label]: resultObject[value],
        };
        onChange(nextChange);
        setSearchState((current) => {
          return {
            ...current,
            searchWord: '',
            selections: Object.keys(nextChange),
          };
        });
      }
    },
    [resultObject, getValues],
  );

  /**
   * Get the <span>-elements value and use the value to remove the key from the form value
   */
  const onSelectionDelete = useCallback(
    (
      e: MouseEvent<HTMLDivElement | HTMLButtonElement>,
      onChange: (...event: unknown[]) => void,
    ) => {
      const formValue = getValues('freeSearchParams') as FreeSearchFormObject;

      const { [e.currentTarget?.innerText]: _, ...nextChange } = formValue;

      onChange(nextChange);
      setSearchState((current) => ({
        ...current,
        selections: Object.keys(nextChange || {}),
      }));
    },
    [getValues],
  );

  const handleSetSearchWord = useCallback(
    (value: string) =>
      setSearchState((current) => {
        return { ...current, searchWord: value };
      }),
    [],
  );

  return (
    <div className="free-search" data-testid="free-search">
      <Controller
        name="freeSearchParams"
        control={control as Control<FieldValues>}
        render={({ field: { onChange, value } }) => (
          <>
            <SearchInput
              label={t('searchForm.searchWord')}
              helperText={t('searchForm.freeSearchDescription') ?? ''}
              searchButtonAriaLabel="Search"
              suggestionLabelField="label"
              getSuggestions={getSuggestions}
              value={searchWord}
              onChange={handleSetSearchWord}
              onSubmit={(v) => handleSubmit(v, onChange)}
              clearButtonAriaLabel="Clear free search field"
            />
            <div className="search-selections">
              {Object.keys(value || {}).map((s) => (
                <Tag
                  key={s}
                  onDelete={(e) => {
                    onSelectionDelete(e as React.MouseEvent<HTMLDivElement>, onChange);
                  }}
                >
                  {s}
                </Tag>
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
};

export default memo(FreeSearchForm);
