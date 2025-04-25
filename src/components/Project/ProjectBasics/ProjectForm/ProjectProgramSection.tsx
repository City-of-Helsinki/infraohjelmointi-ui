import { FormSectionTitle, SelectField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { FC, memo } from 'react';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useOptions } from '@/hooks/useOptions';
import { validateMaxLength } from '@/utils/validation';
import { t } from 'i18next';

interface IProjectProgramSectionProps {
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isUserOnlyViewer: boolean;
  isInputDisabled: boolean;
}
const ProjectProgramSection: FC<IProjectProgramSectionProps> = ({ getFieldProps, isUserOnlyViewer, isInputDisabled }) => {
  const budgetOverrunReasons = useOptions('budgetOverrunReasons');

  return (
    <div className="w-full" id="basics-location-section">
      <FormSectionTitle {...getFieldProps('projectProgramTitle')} />
      <div className="form-row">
        <div className="form-col-xxl">
          <SelectField
              {...getFieldProps('budgetOverrunReason')}
              options={budgetOverrunReasons}
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
            rules={{ ...validateMaxLength(200, t) }}
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
