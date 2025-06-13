import {
  FormSectionTitle,
  ListField,
  NumberField,
  SelectField,
} from '@/components/shared';
import { FC, memo, useMemo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import { validateInteger, validateMaxLength } from '@/utils/validation';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectIsProjectSaving } from '@/reducers/projectSlice';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import TextAreaField from '@/components/shared/TextAreaField';

interface IProjectFinancialSectionProps {
  control: Control<IProjectForm>;
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
    sapCosts: IProjectSapCost | null;
    sapCurrentYear: IProjectSapCost | null;
  };
  classOptions: {
    masterClasses: IOption[];
    classes: IOption[];
    subClasses: IOption[];
  };
  isInputDisabled: boolean;
  isUserOnlyViewer: boolean;
}
const ProjectFinancialSection: FC<IProjectFinancialSectionProps> = ({
  getValues,
  getFieldProps,
  classOptions,
  isInputDisabled,
  isUserOnlyViewer,
}) => {
  const { t } = useTranslation();

  const { masterClasses, classes, subClasses } = classOptions;

  const isSaving = useAppSelector(selectIsProjectSaving);

  const constructionPhases = useOptions('constructionPhases');
  const projectQualityLevels = useOptions('projectQualityLevels');
  const planningPhases = useOptions('planningPhases');
  const budgetOverrunReasons = useOptions('budgetOverrunReasons');

  const validateBudgetOverrunReason = useMemo(
    () => ({
      validate: {
        isBudgetOverrunReasonValid: (budgetOverrunReason: IOption) => {
          const mappedBudgetOverrunReason = budgetOverrunReasons.find(item => item.value === budgetOverrunReason.value);
          const otherReason = getValues('otherBudgetOverrunReason');

          if (mappedBudgetOverrunReason?.label == 'otherReason' && otherReason == '') {
            return t('validation.required', { field: t('projectForm.otherBudgetOverrunReason') });
          }
          return true;
        },
      },
    }),
    [budgetOverrunReasons, getValues],
  );

  const validateOtherReasonField = useMemo(
    () => ({
      validate: {
        isOtherReasonFieldValid: (otherReasonField: string) => {
          const budgetOverrunReason = budgetOverrunReasons.find(item => item.value === getValues('budgetOverrunReason').value);
          const isBudgetOverrunReasonOtherReason = budgetOverrunReason?.label == 'otherReason'

          if (isBudgetOverrunReasonOtherReason && otherReasonField == '') {
            return t('validation.required', { field: t('projectForm.otherBudgetOverrunReason') });
          }
          return true;
        },
      },
    }),
    [budgetOverrunReasons, getValues],
  );

  const renderSelectField = (
    name: string,
    options: IOption[],
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
            readOnly: true,
            isSapProject: true,
          },
          {
            ...getFieldProps('realizedCost'),
            readOnly: true,
            isSapProject: true,
          },
          {
            ...getFieldProps('comittedCost'),
            readOnly: true,
            isSapProject: true,
          },
          {
            ...getFieldProps('spentCost'),
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
              size='full'
              disabled={isInputDisabled}
              readOnly={isUserOnlyViewer}
            />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xxl">
          <TextAreaField
            {...getFieldProps('otherBudgetOverrunReason')}
            rules={{ ...validateMaxLength(200, t), ...validateOtherReasonField }}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectFinancialSection);
