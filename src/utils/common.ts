import { IListItem, IOption } from '@/interfaces/common';
import { TFunction } from 'i18next';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const listItemToOption = (
  listItem: IListItem | undefined,
  translate?: TFunction<'translation'>,
): IOption => ({
  label: translate ? translate(`enums.${listItem?.value}`) : listItem?.value || '',
  value: listItem?.id || '',
});
