import { IListItem, IOption } from '@/interfaces/common';
import { IAppForms } from '@/interfaces/formInterfaces';
import { TFunction } from 'i18next';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const removeDotsFromString = (value: string) => value.replace('.', '');

export const listItemToOption = (
  listItem: IListItem | undefined,
  translate?: TFunction<'translation'>,
): IOption => ({
  label:
    listItem?.value && translate
      ? translate(`enums.${removeDotsFromString(listItem?.value)}`)
      : listItem?.value || '',
  value: listItem?.id || '',
});

/**
 * Converts all empty string values from a form to null values. Useful when submitting forms,
 * since controlled forms always need to have a value as an empty string instead of null or undefined.
 */
export const emptyStringsToNull = (formData: IAppForms) => {
  const transformedFields = Object.keys(formData)
    .filter((field) => typeof formData[field as keyof IAppForms] === 'string')
    .reduce((accumulator, current) => {
      const key = current as keyof IAppForms;
      return { ...accumulator, [current]: formData[key] || null };
    }, {});

  return { ...formData, ...transformedFields };
};

export const getOptionId = (option: IOption) => option.value || null;
