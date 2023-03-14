import { Tag } from 'hds-react/components/Tag';
import { SearchInput } from 'hds-react/components/SearchInput';
import { memo, useCallback, useState, MouseEvent } from 'react';
import { getProjectsWithFreeSearch } from '@/services/projectServices';
import { useTranslation } from 'react-i18next';
import { arrayHasValue, listItemToOption, objectHasProperty } from '@/utils/common';
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
  const resultList = [];
  for (const [key, value] of Object.entries(res)) {
    resultList.push(
      ...value.map((v: IListItem) => ({
        id: v.id,
        value: `${key === 'hashtags' ? '#' : ''}${v.value}`,
        type: key,
      })),
    );
  }
  return resultList;
};

interface ISearchState {
  searchWord: string;
  resultObject: FreeSearchFormObject;
}

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
    (inputValue: string) =>
      new Promise<{ value: string; label: string }[]>((resolve, reject) => {
        getProjectsWithFreeSearch(inputValue)
          .then((res) => {
            const formValue = getValues('freeSearchParams');
            // Create a combined list of all results and filter already added values
            const resultList = freeSearchResultsToList(res || {}).filter(
              (f) => !arrayHasValue(Object.keys(formValue), f.value),
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
            resolve(freeSearchFormItemList || []);
          })
          .catch(() => reject([]));
      }),
    [],
  );

  /**
   * Gets the selectedValue and uses the resultObject to get the id and type for the
   * selectedValue, if it exists in resultObject and isn't already an added value
   */
  const handleSubmit = useCallback(
    (value: string, onChange: (...event: unknown[]) => void) => {
      const formValue = getValues('freeSearchParams');
      if (!arrayHasValue(Object.keys(formValue), value) && objectHasProperty(resultObject, value)) {
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
    [resultObject],
  );

  /**
   * Get the <span>-elements value and use the value to remove the key from the form value
   */
  const onSelectionDelete = useCallback(
    (e: MouseEvent<HTMLButtonElement>, onChange: (...event: unknown[]) => void) => {
      const formValue = getValues('freeSearchParams') as FreeSearchFormObject;
      // Copy everything except the chosen value to a new object, since react-hook-forms freezes the object
      const {
        [(e.currentTarget as HTMLButtonElement)?.parentElement?.innerText as string]: _,
        ...nextChange
      } = formValue;

      onChange(nextChange);
      setSearchState((current) => ({
        ...current,
        selections: Object.keys(nextChange || {}),
      }));
    },
    [],
  );

  const handleSetSearchWord = useCallback(
    (value: string) => setSearchState((current) => ({ ...current, searchWord: value })),
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
              helperText={t('searchForm.freeSearchDescription') || ''}
              searchButtonAriaLabel="Search"
              suggestionLabelField="label"
              getSuggestions={getSuggestions}
              value={searchWord}
              onChange={handleSetSearchWord}
              onSubmit={(v) => handleSubmit(v, onChange)}
            />
            <div className="search-selections">
              {Object.keys(value || {}).map((s) => (
                <Tag key={s} onDelete={(e) => onSelectionDelete(e, onChange)}>
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
