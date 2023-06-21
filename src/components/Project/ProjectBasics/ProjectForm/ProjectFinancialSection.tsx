import {
  FormSectionTitle,
  ListField,
  NumberField,
  OverrunRightField,
  SelectField,
} from '@/components/shared';
import { FC, memo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import { validateMaxLength } from '@/utils/validation';
import { useTranslation } from 'react-i18next';

interface IProjectFinancialSectionProps {
  control: Control<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  classOptions: {
    masterClasses: IOption[];
    classes: IOption[];
    subClasses: IOption[];
  };
}
const ProjectFinancialSection: FC<IProjectFinancialSectionProps> = ({
  getFieldProps,
  control,
  classOptions,
}) => {
  const { t } = useTranslation();

  const { masterClasses, classes, subClasses } = classOptions;

  const constructionPhases = useOptions('constructionPhases');
  const projectQualityLevels = useOptions('projectQualityLevels');
  const planningPhases = useOptions('planningPhases');

  return (
    <div className="w-full" id="basics-financials-section">
      <FormSectionTitle {...getFieldProps('financial')} />
      <div className="form-row">
        <div className="form-col-xxl">
          <SelectField
            {...getFieldProps('masterClass')}
            options={masterClasses}
            size="full"
            shouldTranslate={false}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <SelectField {...getFieldProps('class')} options={classes} shouldTranslate={false} />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('subClass')}
            options={subClasses}
            shouldTranslate={false}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('projectCostForecast')}
            tooltip="keur"
            hideLabel={true}
            rules={validateMaxLength(10, t)}
          />
        </div>
        <div className="form-col-lg">
          <SelectField {...getFieldProps('projectQualityLevel')} options={projectQualityLevels} />
        </div>
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('projectWorkQuantity')}
            tooltip="keur"
            rules={validateMaxLength(10, t)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('planningCostForecast')}
            tooltip="keur"
            hideLabel={true}
            rules={validateMaxLength(10, t)}
          />
        </div>
        <div className="form-col-lg">
          <SelectField {...getFieldProps('planningPhase')} options={planningPhases} />
        </div>
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('planningWorkQuantity')}
            tooltip="keur"
            rules={validateMaxLength(10, t)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('constructionCostForecast')}
            tooltip="keur"
            hideLabel={true}
            rules={validateMaxLength(10, t)}
          />
        </div>
        <div className="form-col-lg">
          <SelectField {...getFieldProps('constructionPhase')} options={constructionPhases} />
        </div>
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('constructionWorkQuantity')}
            tooltip="keur"
            rules={validateMaxLength(10, t)}
          />
        </div>
      </div>
      <ListField
        {...getFieldProps('realizedCostLabel')}
        fields={[
          { ...getFieldProps('costForecast'), rules: validateMaxLength(15, t) },
          {
            ...getFieldProps('realizedCost'),
            readOnly: true,
          },
          {
            ...getFieldProps('comittedCost'),
            readOnly: true,
          },
          {
            ...getFieldProps('spentCost'),
            readOnly: true,
          },
        ]}
      />
      <OverrunRightField control={control} />
      <ListField {...getFieldProps('preliminaryBudgetDivision')} readOnly={true} />
    </div>
  );
};

export default memo(ProjectFinancialSection);
