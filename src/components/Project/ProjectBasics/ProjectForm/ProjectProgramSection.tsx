import { FormSectionTitle, SelectField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { FC, memo, useMemo } from 'react';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useOptions } from '@/hooks/useOptions';
import { validateMaxLength } from '@/utils/validation';
import { t } from 'i18next';
import { IOption } from '@/interfaces/common';

interface IProjectProgramSectionProps {
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isUserOnlyViewer: boolean;
  isInputDisabled: boolean;
}
const ProjectProgramSection: FC<IProjectProgramSectionProps> = ({ getValues, getFieldProps, isUserOnlyViewer, isInputDisabled }) => {
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

  return (
    <div className="w-full" id="basics-location-section">
      <FormSectionTitle {...getFieldProps('projectProgramTitle')} />
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
      <div className="form-row">
        <div className="form-col-xxl">
          <TextAreaField {...getFieldProps('projectProgram')} readOnly={isUserOnlyViewer}/>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectProgramSection);
