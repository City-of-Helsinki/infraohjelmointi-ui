import { FormSectionTitle, SelectField, TextField } from '@/components/shared';
import { FC, memo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';

interface IProjectResponsiblePersonsSectionProps {
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
}
const ProjectResponsiblePersonsSection: FC<IProjectResponsiblePersonsSectionProps> = ({
  getFieldProps,
}) => {
  const responsiblePersons = useOptions('responsiblePersons', true);

  return (
    <div className="w-full" id="basics-responsible-persons-section">
      <FormSectionTitle {...getFieldProps('responsiblePersons')} />
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personPlanning')}
            icon="person"
            options={responsiblePersons}
          />
        </div>
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personConstruction')}
            icon="person"
            options={responsiblePersons}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <SelectField
            {...getFieldProps('personProgramming')}
            icon="person"
            options={responsiblePersons}
          />
        </div>
        <div className="form-col-md">
          <TextField {...getFieldProps('otherPersons')} />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectResponsiblePersonsSection);
