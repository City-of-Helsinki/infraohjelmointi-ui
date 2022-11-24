import { IListItem, IOption, ListType } from '@/interfaces/common';
import { RootState } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from './common';

export const useOptions = (name?: ListType) => {
  const optionsFromRedux = useAppSelector((state: RootState) => state.lists);
  const [options, setOptions] = useState<Array<IOption> | []>([]);
  const [list, setList] = useState<Array<IListItem>>([]);
  const { t } = useTranslation();

  useEffect(
    function getListByFieldName() {
      if (name) {
        switch (name) {
          case 'type':
            setList(optionsFromRedux.projectTypes);
            break;
          case 'phase':
            setList(optionsFromRedux.projectPhases);
            break;
          default:
            setList([]);
        }
      }
    },
    [optionsFromRedux, name],
  );

  useEffect(
    function parseListToOption() {
      if (list) {
        setOptions(list.map((o) => ({ label: t(`enums.${o.value}`), value: o.id })));
      }
    },
    [list, t],
  );

  const getOptionFromListItem = useMemo(
    () =>
      (listItem?: IListItem): IOption => ({
        label: listItem ? t(`enums.${listItem.value}`) : '',
        value: listItem ? listItem.id : '',
      }),
    [t],
  );

  return { options, getOptionFromListItem };
};
