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
import { validateInteger, validateMaxLength } from '@/utils/validation';
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
  getFieldProps,
  control,
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

  const renderSelectField = (
    name: string,
    options: IOption[],
    size: 'full' | 'lg' | undefined,
    shouldTranslate: boolean,
    shouldNotBeDisabled?: boolean,
  ) => (

    <SelectField
      {...getFieldProps(name)}
      options={options}
      size={size}
      shouldTranslate={shouldTranslate}
      disabled={shouldNotBeDisabled ? false : isInputDisabled}
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

      <OverrunRightField control={control} cancelEdit={isSaving} readOnly={isUserOnlyViewer} isInputDisabled={isInputDisabled}/>
      <ListField
        {...getFieldProps('preliminaryBudgetDivision')}
        readOnly={true}
        cancelEdit={isSaving}
      />
    </div>
  );
};

export default memo(ProjectFinancialSection);
