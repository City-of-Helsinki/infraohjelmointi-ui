import { IListItem } from '@/interfaces/common';
import { IPerson } from '@/interfaces/personsInterfaces';
import { TFunction } from 'i18next';

// A function to turn IPerson or IListItem from backend to correct display name in admin menus tables
const getAdminMenuItemDisplayValue = (
  t: TFunction<'translation', undefined>,
  item: IListItem | IPerson,
  useUntranslatedValues?: boolean,
) => {
  if ('value' in item) {
    return useUntranslatedValues
      ? item.value
      : t(`option.${item.value}`, { defaultValue: item.value });
  }

  return `${item.firstName} ${item.lastName}`;
};

// A function to check if item is IPerson or IListItem and return IPerson data in
// correct form for admin menu add or edit dialog, if item is of type IPerson
const getPersonTypeDialogValues = (item: IListItem | IPerson) => {
  if ('value' in item) return undefined;

  const { firstName, lastName, email, phone, title } = item;

  return {
    firstName,
    lastName,
    email,
    phone,
    title,
  };
};

export { getAdminMenuItemDisplayValue, getPersonTypeDialogValues };
