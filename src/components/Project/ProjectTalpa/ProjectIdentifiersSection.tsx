import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import { useTranslation } from 'react-i18next';
import { validateMaxLength, validateRequired } from '@/utils/validation';
import { useFormContext } from 'react-hook-form';
import { BudgetItemNumber } from './budgetItemNumber';
import { selectTalpaProjectRanges } from '@/reducers/listsSlice';
import { useSelector } from 'react-redux';
import { listItemsToOption } from '@/utils/common';

export default function ProjectIdentifiersSection() {
  const { t } = useTranslation();
  const { watch } = useFormContext();
  const budgetItemNumber = watch('budgetItemNumber');
  const talpaProjectRanges = useSelector(selectTalpaProjectRanges);

  return (
    <div className="mb-12">
      <FormSectionTitle label="projectTalpaForm.projectIdentifiers" name="projectIdentifiers" />
      {/* Talousarviokohdan nimi */}
      <TextField
        {...getFieldProps('budgetAccount')}
        rules={{ ...validateRequired('budgetAccount', t) }}
        size="full"
      />
      {/* Projektinumeroväli */}
      <SelectField
        {...getFieldProps('projectNumberRange')}
        options={listItemsToOption(talpaProjectRanges)}
        rules={{ ...validateRequired('projectNumberRange', t) }}
        size="full"
        placeholder={t('projectTalpaForm.projectNumberRangePlaceholder')}
      />
      {/* Malliprojekti */}
      {budgetItemNumber === BudgetItemNumber.InfraInvestment ? (
        <TextField
          {...getFieldProps('templateProject')}
          defaultValue="2814I00000"
          rules={{ ...validateRequired('templateProject', t) }}
          size="full"
        />
      ) : (
        <SelectField
          {...getFieldProps('templateProject')}
          options={[]}
          rules={{ ...validateRequired('templateProject', t) }}
          size="full"
        />
      )}
      {/* Laji */}
      <SelectField
        {...getFieldProps('projectType')}
        options={[]}
        rules={{ ...validateRequired('projectType', t) }}
        size="full"
        placeholder={t('projectTalpaForm.projectTypePlaceholder')}
      />
      {/* Prioriteetti */}
      <SelectField
        {...getFieldProps('priority')}
        options={[]}
        rules={{ ...validateRequired('priority', t) }}
        size="full"
        placeholder={t('projectTalpaForm.priorityPlaceholder')}
      />
      {/* SAP-nimi */}
      <TextField
        {...getFieldProps('projectName')}
        rules={{
          ...validateRequired('projectName', t),
          ...validateMaxLength(24, t),
        }}
        size="full"
        placeholder={t('projectTalpaForm.projectNamePlaceholder')}
        helperText={t('projectTalpaForm.projectNameHelpText')}
      />
    </div>
  );
}
