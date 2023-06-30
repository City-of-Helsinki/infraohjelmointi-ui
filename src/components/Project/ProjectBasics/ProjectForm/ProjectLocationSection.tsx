import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { FC, memo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';

interface IProjectLocationSectionProps {
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  locationOptions: {
    districts: IOption[];
    divisions: IOption[];
    subDivisions: IOption[];
  };
}
const ProjectLocationSection: FC<IProjectLocationSectionProps> = ({
  getFieldProps,
  locationOptions,
}) => {
  const { t } = useTranslation();

  const { districts, divisions, subDivisions } = locationOptions;

  const responsibleZones = useOptions('responsibleZones');

  return (
    <div className="w-full" id="basics-location-section">
      <FormSectionTitle {...getFieldProps('location')} />
      <div className="form-row">
        <div className="form-col-xxl">
          <SelectField
            {...getFieldProps('responsibleZone')}
            options={responsibleZones}
            rules={{
              required: t('validation.required', { field: 'Alueen vastuujaon mukaan' }) ?? '',
            }}
            size="full"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xxl">
          <SelectField
            {...getFieldProps('district')}
            iconKey="location"
            options={districts}
            size="full"
            shouldTranslate={false}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('division')}
            iconKey="location"
            options={divisions}
            shouldTranslate={false}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('subDivision')}
            iconKey="location"
            options={subDivisions}
            shouldTranslate={false}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <TextField {...getFieldProps('masterPlanAreaNumber')} />
        </div>
        <div className="form-col-md">
          <TextField {...getFieldProps('trafficPlanNumber')} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <TextField {...getFieldProps('bridgeNumber')} />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectLocationSection);
