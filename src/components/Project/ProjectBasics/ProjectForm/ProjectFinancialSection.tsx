import { FormSectionTitle, ListField, NumberField, SelectField } from '@/components/shared';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import { validateInteger, validateMaxLength } from '@/utils/validation';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectIsProjectSaving, selectProject } from '@/reducers/projectSlice';
import TextAreaField from '@/components/shared/TextAreaField';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';
import { Option } from 'hds-react';
import { getProjectSapCosts } from '@/reducers/sapCostSlice';

interface IProjectFinancialSectionProps {
  control: Control<IProjectForm>;
  getValues: UseFormGetValues<IProjectForm>;
  watch: UseFormWatch<IProjectForm>;
  setValue: UseFormSetValue<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  classOptions: {
    masterClasses: Option[];
    classes: Option[];
    subClasses: Option[];
  };
  isInputDisabled: boolean;
  isUserOnlyViewer: boolean;
}
const ProjectFinancialSection: FC<IProjectFinancialSectionProps> = ({
  getValues,
  getFieldProps,
  watch,
  setValue,
  classOptions,
  isInputDisabled,
  isUserOnlyViewer,
}) => {
  const { t } = useTranslation();

  const { masterClasses, classes, subClasses } = classOptions;

  const isSaving = useAppSelector(selectIsProjectSaving);
  const project = useAppSelector(selectProject);
  const sapCosts = useAppSelector(getProjectSapCosts);

  const currentYearSapValues = useMemo(() => {
    if (project?.currentYearsSapValues) {
      const filteredSapValues = project.currentYearsSapValues
        .filter((value) => value.project_id != null)
        .map((value) => ({
          id: value.project_id,
          year: value.year,
          sap_id: value.id,
          project_task_costs: value.project_task_costs,
          project_task_commitments: value.project_task_commitments,
          production_task_costs: value.production_task_costs,
          production_task_commitments: value.production_task_commitments,
        }));
      return filteredSapValues.length > 0 ? filteredSapValues[0] : null;
    }
    return null;
  }, [project?.currentYearsSapValues]);

  const getSapProps = useCallback(
    () => ({
      sapCosts: project ? sapCosts[project?.id] : null,
      sapCurrentYear: project ? currentYearSapValues : null,
    }),
    [project, sapCosts, currentYearSapValues],
  );

  const constructionPhases = useOptions('constructionPhases');
  const projectQualityLevels = useOptions('projectQualityLevels');
  const planningPhases = useOptions('planningPhases');
  const budgetOverrunReasons = useOptions('budgetOverrunReasons');

  const selectedBudgetOverrunReason = watch('budgetOverrunReason');
  const isOtherBudgetOverrunReasonSelected =
    selectedBudgetOverrunReason.value ===
    budgetOverrunReasons.find((item) => item.label === 'otherReason')?.value;

  const validateBudgetOverrunReason = useMemo(
    () => ({
      validate: {
        isBudgetOverrunReasonValid: (budgetOverrunReason: IOption) => {
          const mappedBudgetOverrunReason = budgetOverrunReasons.find(
            (item) => item.value === budgetOverrunReason.value,
          );
          const otherReason = getValues('otherBudgetOverrunReason');

          if (mappedBudgetOverrunReason?.label == 'otherReason' && otherReason == '') {
            return t('validation.required', { field: t('projectForm.otherBudgetOverrunReason') });
          }
          return true;
        },
      },
    }),
    [budgetOverrunReasons, getValues, t],
  );

  const validateOtherReasonField = useMemo(
    () => ({
      validate: {
        isOtherReasonFieldValid: (otherReasonField: string) => {
          const budgetOverrunReason = budgetOverrunReasons.find(
            (item) => item.value === getValues('budgetOverrunReason').value,
          );
          const isBudgetOverrunReasonOtherReason = budgetOverrunReason?.label == 'otherReason';

          if (isBudgetOverrunReasonOtherReason && otherReasonField == '') {
            return t('validation.required', { field: t('projectForm.otherBudgetOverrunReason') });
          }
          return true;
        },
      },
    }),
    [budgetOverrunReasons, getValues, t],
  );

  useEffect(() => {
    if (!isOtherBudgetOverrunReasonSelected) {
      // Clear the "other reason" text field and reset "on schedule" when "other reason" is not selected
      setValue('otherBudgetOverrunReason', '', { shouldValidate: true, shouldDirty: true });
      setValue('onSchedule', null, { shouldDirty: true });
    } else if (getValues('onSchedule') === null) {
      // Set "on schedule" to true by default when "other reason" is selected
      setValue('onSchedule', true, { shouldDirty: true });
    }
  }, [isOtherBudgetOverrunReasonSelected, setValue, getValues]);

  const renderSelectField = (
    name: string,
    options: Option[],
    size: 'full' | 'lg' | undefined,
    shouldTranslate: boolean,
    userIsProjectManager?: boolean,
  ) => (
    <SelectField
      {...getFieldProps(name)}
      options={options}
      size={size}
      shouldTranslate={shouldTranslate}
      disabled={userIsProjectManager ? false : isInputDisabled}
      readOnly={isUserOnlyViewer}
      clearable
    />
  );

  const renderNumberField = (name: string, tooltip: string, hideLabel: boolean) => (
    <NumberField
      {...getFieldProps(name)}
      tooltip={tooltip}
      hideLabel={hideLabel}
      rules={validateMaxLength(10, t)}
      readOnly={isUserOnlyViewer}
    />
  );

  return (
    <div className="w-full" id="basics-financials-section">
      <FormSectionTitle {...getFieldProps('financial')} />
      <div className="form-row">
        <div className="form-col-xxl">
          {renderSelectField('masterClass', masterClasses, 'full', false)}
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">{renderSelectField('class', classes, undefined, false)}</div>
        <div className="form-col-md">
          {renderSelectField('subClass', subClasses, undefined, false)}
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-sm">{renderNumberField('projectCostForecast', 'keur', true)}</div>
        <div className="form-col-lg">
          {renderSelectField('projectQualityLevel', projectQualityLevels, undefined, true, true)}
        </div>
        <div className="form-col-sm">{renderNumberField('projectWorkQuantity', 'm2', false)}</div>
      </div>
      <div className="form-row">
        <div className="form-col-sm">{renderNumberField('planningCostForecast', 'keur', true)}</div>
        <div className="form-col-lg">
          {renderSelectField('planningPhase', planningPhases, undefined, true, true)}
        </div>
        <div className="form-col-sm">{renderNumberField('planningWorkQuantity', 'm2', false)}</div>
      </div>
      <div className="form-row">
        <div className="form-col-sm">
          {renderNumberField('constructionCostForecast', 'keur', true)}
        </div>
        <div className="form-col-lg">
          {renderSelectField('constructionPhase', constructionPhases, undefined, true, true)}
        </div>
        <div className="form-col-sm">
          {renderNumberField('constructionWorkQuantity', 'm2', false)}
        </div>
      </div>
      <ListField
        {...getFieldProps('realizedCostLabel')}
        disabled={isInputDisabled}
        readOnly={isUserOnlyViewer}
        fields={[
          {
            ...getFieldProps('costForecast'),
            rules: {
              ...validateMaxLength(15, t),
              ...validateInteger(t),
            },
          },
          {
            ...getFieldProps('realizedCostCurrentYear'),
            ...getSapProps(),
            readOnly: true,
            isSapProject: true,
          },
          {
            ...getFieldProps('realizedCost'),
            ...getSapProps(),
            readOnly: true,
            isSapProject: true,
          },
          {
            ...getFieldProps('comittedCost'),
            ...getSapProps(),
            readOnly: true,
            isSapProject: true,
          },
          {
            ...getFieldProps('spentCost'),
            ...getSapProps(),
            readOnly: true,
            isSapProject: true,
          },
        ]}
        cancelEdit={isSaving}
      />
      <div className="form-row">
        <div className="form-col-xxl">
          <SelectField
            {...getFieldProps('budgetOverrunReason')}
            options={budgetOverrunReasons}
            rules={validateBudgetOverrunReason}
            size="full"
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
            clearable
          />
        </div>
        {isOtherBudgetOverrunReasonSelected && (
          <div className="form-col-md">
            <RadioCheckboxField {...getFieldProps('onSchedule')} />
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-col-xxl">
          <TextAreaField
            {...getFieldProps('otherBudgetOverrunReason')}
            rules={{ ...validateMaxLength(200, t), ...validateOtherReasonField }}
            readOnly={isUserOnlyViewer}
            disabled={!isOtherBudgetOverrunReasonSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectFinancialSection);
