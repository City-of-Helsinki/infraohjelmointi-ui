import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { getFieldProps } from './ProjectTalpaForm';
import { useTranslation } from 'react-i18next';
import { validateMaxLength, validateRequired } from '@/utils/validation';
import { useFormContext } from 'react-hook-form';
import { BudgetItemNumber } from './budgetItemNumber';
import { selectTalpaProjectRanges, selectTalpaProjectTypes } from '@/reducers/listsSlice';
import { useSelector } from 'react-redux';
import { groupOptions } from '@/utils/common';
import { useEffect, useMemo } from 'react';
import {
  infraInvestmentTemplateProject,
  preConstructionTemplateProjectOptions,
} from './templateProjectOptions';
import { uniqBy } from 'lodash';
import { defaultFilter } from 'hds-react';
import { IProjectTalpaForm } from '@/interfaces/formInterfaces';

const formatCategoryLabel = (category?: string | null) => {
  if (!category) {
    return '';
  }

  const normalized = category.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export default function ProjectIdentifiersSection() {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    formState: { dirtyFields, touchedFields },
  } = useFormContext<IProjectTalpaForm>();
  const [budgetItemNumber, projectType] = watch(['budgetItemNumber', 'projectType']);
  const talpaProjectRanges = useSelector(selectTalpaProjectRanges);
  const talpaProjectTypes = useSelector(selectTalpaProjectTypes);
  const budgetItemNumberTouched = Boolean(touchedFields?.budgetItemNumber);
  const budgetItemNumberDirty = Boolean(dirtyFields?.budgetItemNumber);
  const projectTypeDirty = Boolean(dirtyFields?.projectType);

  // Both 2814I and 2814E now have budgetAccount populated - unified filter
  const filteredProjectRanges = talpaProjectRanges.filter(
    (projectRange) =>
      projectRange.projectTypePrefix === budgetItemNumber &&
      projectRange.budgetAccount &&
      projectRange.budgetAccount.trim() !== '' &&
      !projectRange.budgetAccount.toLowerCase().includes('malli'),
  );

  // Unified grouping - groupLabel is always populated for both 2814I and 2814E
  const projectRangeGroups = useMemo(
    () =>
      groupOptions(
        filteredProjectRanges,
        // Group by groupLabel (e.g., "8 03 01 01 Katujen uudisrakentaminen")
        (projectRange) => projectRange.groupLabel ?? projectRange.budgetAccount ?? '',
        (projectRange) => ({
          label: projectRange.displayName || '',
          value: projectRange.id,
          selected: false,
          isGroupLabel: false,
          visible: true,
          disabled: false,
        }),
      ),
    [filteredProjectRanges],
  );

  const projectTypeGroups = useMemo(
    () =>
      groupOptions(
        uniqBy(
          talpaProjectTypes.filter((pt) => pt.priority === null),
          'name',
        ),
        (projectType) => formatCategoryLabel(projectType.category),
        (projectType) => ({
          label: projectType.name,
          value: projectType.id,
          selected: false,
          isGroupLabel: false,
          visible: true,
          disabled: false,
        }),
      ),
    [talpaProjectTypes],
  );

  const priorityGroups = useMemo(() => {
    if (!projectType?.value) {
      return [];
    }

    const selectedBaseItem = talpaProjectTypes.find((pt) => pt.id === projectType.value);

    if (!selectedBaseItem?.code) return [];

    return groupOptions(
      talpaProjectTypes
        .filter((pt) => pt.priority !== null && pt.code === selectedBaseItem.code)
        .toSorted((a, b) => (a.priority ?? '').localeCompare(b.priority ?? '')),
      () => selectedBaseItem.name,
      (projectType) => ({
        label: `${projectType.priority} / ${projectType.name}`,
        value: projectType.id,
        selected: false,
        isGroupLabel: false,
        visible: true,
        disabled: false,
      }),
    );
  }, [talpaProjectTypes, projectType]);

  useEffect(() => {
    if (budgetItemNumberDirty || budgetItemNumberTouched) {
      setValue('projectNumberRange', null);

      if (budgetItemNumber === BudgetItemNumber.InfraInvestment) {
        setValue('templateProject', infraInvestmentTemplateProject);
      } else {
        setValue('templateProject', '');
      }
    }
  }, [budgetItemNumber, budgetItemNumberDirty, budgetItemNumberTouched, setValue]);

  useEffect(() => {
    if (projectTypeDirty) {
      setValue('priority', null);
    }
  }, [projectTypeDirty, projectType, setValue]);

  return (
    <div className="mb-12">
      <FormSectionTitle label="projectTalpaForm.projectIdentifiers" name="projectIdentifiers" />
      {/* Talousarviokohdan nimi */}
      <TextField {...getFieldProps('budgetAccount')} size="full" />
      {/* Projektinumeroväli */}
      <SelectField
        {...getFieldProps('projectNumberRange')}
        groups={projectRangeGroups}
        filter={defaultFilter}
        rules={{ ...validateRequired('projectNumberRange', t) }}
        size="full"
        placeholder={t('projectTalpaForm.projectNumberRangePlaceholder')}
      />
      {/* Malliprojekti */}
      {budgetItemNumber === BudgetItemNumber.InfraInvestment ? (
        <TextField {...getFieldProps('templateProject')} size="full" />
      ) : (
        <SelectField
          {...getFieldProps('templateProject')}
          options={preConstructionTemplateProjectOptions}
          shouldTranslate={false}
          rules={{ ...validateRequired('templateProject', t) }}
          size="full"
        />
      )}
      {/* Laji */}
      <SelectField
        {...getFieldProps('projectType')}
        groups={projectTypeGroups}
        filter={defaultFilter}
        rules={{ ...validateRequired('projectType', t) }}
        size="full"
        placeholder={t('projectTalpaForm.projectTypePlaceholder')}
      />
      {/* Prioriteetti */}
      <SelectField
        {...getFieldProps('priority')}
        groups={priorityGroups}
        filter={defaultFilter}
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
