import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { FC, memo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';

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
  isInputDisabled: boolean;
  isUserOnlyViewer: boolean;
}
const ProjectLocationSection: FC<IProjectLocationSectionProps> = ({
  getFieldProps,
  locationOptions,
  isInputDisabled,
  isUserOnlyViewer
}) => {

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
            size="full"
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
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
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
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
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('subDivision')}
            iconKey="location"
            options={subDivisions}
            shouldTranslate={false}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <TextField {...getFieldProps('masterPlanAreaNumber')} readOnly={isUserOnlyViewer}/>
        </div>
        <div className="form-col-md">
          <TextField {...getFieldProps('trafficPlanNumber')} readOnly={isUserOnlyViewer}/>
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <TextField {...getFieldProps('bridgeNumber')} readOnly={isUserOnlyViewer}/>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectLocationSection);
