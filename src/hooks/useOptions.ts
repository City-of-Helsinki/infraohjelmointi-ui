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

  useEffect(
    function parseListToOption() {
      if (list) {
        setOptions(list.map((o) => ({ label: t(`enums.${o.value}`), value: o.id })));
      }
    },
    [list, t],
  );

  const listItemToOption = useMemo(
    () =>
      (listItem?: IListItem): IOption => {
        return {
          label: listItem ? t(`enums.${listItem.value}`) : '',
          value: listItem ? listItem.id : '',
        };
      },
    [t],
  );

  return { options, listItemToOption };
};
