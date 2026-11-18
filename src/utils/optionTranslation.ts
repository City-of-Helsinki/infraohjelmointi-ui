import { TFunction } from 'i18next';

const missingTranslation = '\u0000';

const translateOrOriginal = (t: TFunction, key: string, original: string): string => {
  const translation = t(key, { defaultValue: missingTranslation, nsSeparator: false });
  return translation === missingTranslation ? original : translation;
};

export const translateOption = (t: TFunction, value: string): string =>
  translateOrOriginal(t, `option.${value}`, value);

export const translateCategoryDescription = (t: TFunction, name: string): string => {
  const key = /^K5\.[1-5]$/.test(name) ? name.replace('.', '') : name;
  return translateOrOriginal(t, `projectData.category.${key}`, name);
};
