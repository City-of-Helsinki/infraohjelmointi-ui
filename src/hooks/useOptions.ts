import { IListItem, IOption, ListType } from '@/interfaces/common';
import { IListState } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from './common';

/**
 * This hook creates an options list and returns a function to convert a IListItem to an option.
 *
 * If the optional name? parameter is given, it will try to fetch that corresponding list from redux.
 *
 * @param name a ListType, restricted to the lists that we have in redux
 * @returns options & listItemToOption
 */
export const useOptions = (name?: ListType) => {
  const list = useAppSelector((state: RootState) => state.lists[name as keyof IListState]);
  const [options, setOptions] = useState<Array<IOption> | []>([]);
  const { t } = useTranslation();

  const translate = useMemo(() => t, [t]);

  // Parse an array of list-items to an array of options to use SelectField
  useEffect(
    () => {
      setOptions(list && list.map((o) => ({ label: translate(`enums.${o.value}`), value: o.id })));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list],
  );

  const listItemToOption = (listItem?: IListItem): IOption => ({
    label: listItem ? translate(`enums.${listItem.value}`) : '',
    value: listItem ? listItem.id : '',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps

  return { options, listItemToOption };
};
