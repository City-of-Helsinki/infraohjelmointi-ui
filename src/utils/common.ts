import { IClass } from '@/interfaces/classInterfaces';
import { IListItem, IOption } from '@/interfaces/common';
import { IAppForms, IFormValueType } from '@/interfaces/formInterfaces';
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
      : listItem?.value ?? '',
  value: listItem?.id ?? '',
});

export const booleanToString = (
  boolVal: boolean | undefined,
  translate?: TFunction<'translation'>,
): string =>
  typeof boolVal === 'boolean' && translate ? translate(`enums.${boolVal.toString()}`) : 'Ei';

/**
 * Converts all empty string values from a form to null values. Useful when submitting forms,
 * since controlled forms always need to have a value as an empty string instead of null or undefined.
 */
export const emptyStringsToNull = (formData: IAppForms) => {
  const transformedFields = Object.keys(formData)
    .filter((field) => typeof formData[field as keyof IAppForms] === 'string')
    .reduce((accumulator, current) => {
      const key = current as keyof IAppForms;
      return { ...accumulator, [current]: formData[key] ?? null };
    }, {});

  return { ...formData, ...transformedFields };
};

export const getOptionId = (option: IOption) => option.value || null;

export const objectHasProperty = (obj: object, prop: string) =>
  Object.prototype.hasOwnProperty.call(obj, prop);

export const isOption = (obj: object) =>
  objectHasProperty(obj, 'label') && objectHasProperty(obj, 'value');

/**
 *
 * @param dirtyFields dirtyFields from react-hook-forms
 * @param form form object
 * @returns data object that can be used for a patch request
 */
export const dirtyFieldsToRequestObject = (dirtyFields: object, form: IAppForms) => {
  const data = {};

  const parseValue = (value: IFormValueType) => {
    switch (true) {
      case value instanceof Object && isOption(value):
        return getOptionId(value as IOption);
      case value === '':
        return null;
      default:
        return value;
    }
  };

  for (const key in dirtyFields) {
    const getKey = () => {
      if (['masterClass', 'class', 'subClass'].includes(key)) {
        return 'projectClass';
      } else if (['district', 'division', 'subDivision'].includes(key)) {
        return 'projectLocation';
      } else {
        return key;
      }
    };

    Object.assign(data, { [getKey()]: parseValue(form[key as keyof IAppForms]) });
  }

  // Remove the project location when the class is patched since the relation changes
  if (Object.keys(data).includes('projectClass')) {
    Object.assign(data, { projectLocation: null });
  }

  return data;
};

export const setProgrammedYears = () => {
  const currentYear = new Date().getFullYear();
  const years: Array<IListItem> = [];

  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push({ id: i.toString(), value: i.toString() });
  }
  return years;
};

export const arrayHasValue = (arr: Array<unknown> | undefined, value: string) =>
  arr && arr.indexOf(value) !== -1;

export const classesToListItems = (classes: Array<IClass>): Array<IListItem> =>
  classes.map((mc) => ({
    id: mc.id,
    value: mc.name,
  }));

export const classesToOptions = (classes: Array<IClass>): Array<IOption> =>
  classes.map((mc) => ({
    value: mc.id,
    label: mc.name,
  }));
