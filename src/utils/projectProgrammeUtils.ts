import { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';
import { TFunction } from 'i18next';
import { FieldPath } from 'react-hook-form';

export function getFieldPropsForProjectProgrammeForm(name: FieldPath<IProjectProgrammeForm>) {
  const fieldName = name.split('.').at(-1) ?? name;

  return {
    name,
    label: `projectProgrammeForm.${fieldName}`,
  };
}

export const requiredTrimmedRule = (labelKey: string, t: TFunction) => ({
  required: t('validation.required', { field: t(labelKey) }),
  validate: (value: string | null | undefined) =>
    value?.trim() ? true : t('validation.required', { field: t(labelKey) }),
});
