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

export default function ProjectIdentifiersSection() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const [budgetItemNumber, projectType] = watch(['budgetItemNumber', 'projectType']);
  const talpaProjectRanges = useSelector(selectTalpaProjectRanges);
  const talpaProjectTypes = useSelector(selectTalpaProjectTypes);

  const filteredProjectRanges = talpaProjectRanges.filter(
    (projectRange) => projectRange.projectTypePrefix === budgetItemNumber,
  );

  const projectRangeGroups = useMemo(
    () =>
      budgetItemNumber === BudgetItemNumber.InfraInvestment
        ? groupOptions(
            filteredProjectRanges,
            (projectRange) => projectRange.budgetAccount,
            (projectRange) => ({
              label: `${projectRange.majorDistrictName} / ${projectRange.rangeStart} - ${projectRange.rangeEnd}`,
              value: projectRange.id,
              selected: false,
              isGroupLabel: false,
              visible: true,
              disabled: false,
            }),
          )
        : groupOptions(
            filteredProjectRanges,
            (projectRange) => projectRange.budgetAccount,
            (projectRange) => ({
              label: `${projectRange.unit} / ${projectRange.rangeStart} - ${projectRange.rangeEnd}`,
              value: projectRange.id,
              selected: false,
              isGroupLabel: false,
              visible: true,
              disabled: false,
            }),
          ),
    [budgetItemNumber, filteredProjectRanges],
  );

  const projectTypeGroups = useMemo(
    () =>
      groupOptions(
        uniqBy(talpaProjectTypes, 'name'),
        (projectType) => projectType.category,
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
    if (!projectType?.label) {
      return [];
    }

    return groupOptions(
      talpaProjectTypes.filter((pt) => pt.name === projectType.label),
      (projectType) => projectType.name,
      (projectType) => ({
        label: `${projectType.priority} / ${projectType.description}`,
        value: projectType.id,
        selected: false,
        isGroupLabel: false,
        visible: true,
        disabled: false,
      }),
    );
  }, [talpaProjectTypes, projectType]);

  useEffect(() => {
    if (budgetItemNumber === BudgetItemNumber.InfraInvestment) {
      setValue('templateProject', infraInvestmentTemplateProject);
    }
  }, [budgetItemNumber, setValue]);

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
        groups={projectRangeGroups}
        filter={defaultFilter}
        rules={{ ...validateRequired('projectNumberRange', t) }}
        size="full"
        placeholder={t('projectTalpaForm.projectNumberRangePlaceholder')}
      />
      {/* Malliprojekti */}
      {budgetItemNumber === BudgetItemNumber.InfraInvestment ? (
        <TextField
          {...getFieldProps('templateProject')}
          rules={{ ...validateRequired('templateProject', t) }}
          size="full"
        />
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
        rules={
          budgetItemNumber === BudgetItemNumber.InfraInvestment
            ? { ...validateRequired('projectType', t) }
            : undefined
        }
        size="full"
        placeholder={t('projectTalpaForm.projectTypePlaceholder')}
      />
      {/* Prioriteetti */}
      <SelectField
        {...getFieldProps('priority')}
        groups={priorityGroups}
        filter={defaultFilter}
        rules={
          budgetItemNumber === BudgetItemNumber.InfraInvestment
            ? { ...validateRequired('priority', t) }
            : undefined
        }
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
