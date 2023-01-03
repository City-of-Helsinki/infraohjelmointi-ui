import { IListItem, ListType } from '@/interfaces/common';
import { IListState } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import { listItemToOption } from '@/utils/common';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from './common';
import _ from 'lodash';

/**
 * This hook creates an options list and returns a function to convert a IListItem to an option.
 *
 * If the optional name? parameter is given, it will try to fetch that corresponding list from redux.
 *
 * @param name a ListType, restricted to the lists that we have in redux
 * @returns options & listItemToOption
 */
export const useOptions = (name?: ListType) => {
  const { t } = useTranslation();

  const optionsList = useAppSelector(
    (state: RootState) => state.lists[name as keyof IListState],
    _.isEqual,
  ) as Array<IListItem>;

  const isClassList = name === 'masterClass' || name === 'class' || name === 'subClass';

  const options = useMemo(
    () => optionsList.map((i) => listItemToOption(i, isClassList ? undefined : t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [optionsList],
  );

  return { options };
};
