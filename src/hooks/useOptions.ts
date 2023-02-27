import { IListItem, ListType } from '@/interfaces/common';
import { IListState } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import { listItemToOption } from '@/utils/common';
import { useMemo } from 'react';
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
export const useOptions = (name?: ListType, shouldNotTranslate?: boolean) => {
  const { t } = useTranslation();

  const optionsList = useAppSelector(
    (state: RootState) => state.lists[name as keyof IListState],
  ) as Array<IListItem>;

  const options = useMemo(
    () => optionsList.map((i) => listItemToOption(i, shouldNotTranslate ? undefined : t)),
    [optionsList],
  );

  return options;
};
