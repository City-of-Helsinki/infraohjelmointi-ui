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

export const requiredRule = (labelKey: string, t: TFunction) => ({
  required: t('validation.required', { field: t(labelKey) }),
});
