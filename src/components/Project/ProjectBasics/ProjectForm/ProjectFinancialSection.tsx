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
import { useAppSelector } from '@/hooks/common';
import { selectIsProjectSaving } from '@/reducers/projectSlice';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

interface IProjectFinancialSectionProps {
  control: Control<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
    sapCosts: IProjectSapCost | null;
  };
  classOptions: {
    masterClasses: IOption[];
    classes: IOption[];
    subClasses: IOption[];
  };
  isInputDisabled: boolean;
  isUserOnlyViewer: boolean
}
const ProjectFinancialSection: FC<IProjectFinancialSectionProps> = ({
  getFieldProps,
  control,
  classOptions,
  isInputDisabled,
  isUserOnlyViewer
}) => {
  const { t } = useTranslation();

  const { masterClasses, classes, subClasses } = classOptions;

  const isSaving = useAppSelector(selectIsProjectSaving);

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
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('class')}
            options={classes}
            shouldTranslate={false}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('subClass')}
            options={subClasses}
            shouldTranslate={false}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
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
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-lg">
          <SelectField
            {...getFieldProps('projectQualityLevel')}
            options={projectQualityLevels}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('projectWorkQuantity')}
            tooltip="m2"
            rules={validateMaxLength(10, t)}
            readOnly={isUserOnlyViewer}
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
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-lg">
          <SelectField
            {...getFieldProps('planningPhase')}
            options={planningPhases}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('planningWorkQuantity')}
            tooltip="m2"
            rules={validateMaxLength(10, t)}
            readOnly={isUserOnlyViewer}
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
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-lg">
          <SelectField
            {...getFieldProps('constructionPhase')}
            options={constructionPhases}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-sm">
          <NumberField
            {...getFieldProps('constructionWorkQuantity')}
            tooltip="m2"
            rules={validateMaxLength(10, t)}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <ListField
        {...getFieldProps('realizedCostLabel')}
        disabled={isInputDisabled}
        readOnly={isUserOnlyViewer}
        fields={[
          { ...getFieldProps('costForecast'), rules: validateMaxLength(15, t) },
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

      <OverrunRightField control={control} cancelEdit={isSaving} readOnly={isUserOnlyViewer}/>
      <ListField
        {...getFieldProps('preliminaryBudgetDivision')}
        readOnly={true}
        cancelEdit={isSaving}
      />
    </div>
  );
};

export default memo(ProjectFinancialSection);
