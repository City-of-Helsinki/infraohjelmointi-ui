import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import { useTranslation } from 'react-i18next';
import { validateMaxLength, validateRequired } from '@/utils/validation';
import { useFormContext } from 'react-hook-form';
import { BudgetItemNumber } from './budgetItemNumber';

export default function ProjectIdentifiersSection() {
  const { t } = useTranslation();
  const { watch } = useFormContext();
  const budgetItemNumber = watch('budgetItemNumber');

  return (
    <div className="mb-12">
      <FormSectionTitle {...getFieldProps('projectIdentifiers')} />
      <TextField
        {...getFieldProps('budgetItemName')}
        rules={{ ...validateRequired('budgetItemName', t) }}
        size="full"
      />
      <SelectField
        {...getFieldProps('projectNumberRange')}
        options={[]}
        rules={{ ...validateRequired('projectNumberRange', t) }}
        size="full"
        placeholder={t('projectTalpaForm.projectNumberRangePlaceholder')}
      />
      {budgetItemNumber === BudgetItemNumber.InfraInvestment ? (
        <TextField
          {...getFieldProps('exampleProject')}
          defaultValue="2814I00000"
          rules={{ ...validateRequired('exampleProject', t) }}
          size="full"
        />
      ) : (
        <SelectField
          {...getFieldProps('exampleProject')}
          options={[]}
          rules={{ ...validateRequired('exampleProject', t) }}
          size="full"
        />
      )}
      <SelectField
        {...getFieldProps('projectType')}
        options={[]}
        rules={{ ...validateRequired('projectType', t) }}
        size="full"
        placeholder={t('projectTalpaForm.projectTypePlaceholder')}
      />
      <SelectField
        {...getFieldProps('priority')}
        options={[]}
        rules={{ ...validateRequired('priority', t) }}
        size="full"
        placeholder={t('projectTalpaForm.priorityPlaceholder')}
      />
      <TextField
        {...getFieldProps('SAPName')}
        rules={{
          ...validateRequired('SAPName', t),
          ...validateMaxLength(24, t),
        }}
        size="full"
        placeholder={t('projectTalpaForm.SAPNamePlaceholder')}
        helperText={t('projectTalpaForm.SAPNameHelpText')}
      />
    </div>
  );
}
