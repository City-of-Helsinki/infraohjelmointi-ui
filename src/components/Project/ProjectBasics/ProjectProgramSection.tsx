import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { FC, memo } from 'react';
import { Control } from 'react-hook-form';
import { IProjectBasicsForm } from '@/interfaces/formInterfaces';

interface IProjectProgramSectionProps {
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectBasicsForm>;
  };
}
const ProjectProgramSection: FC<IProjectProgramSectionProps> = ({ getFieldProps }) => {
  return (
    <div className="w-full" id="basics-location-section">
      <FormSectionTitle {...getFieldProps('projectProgramTitle')} />
      <div className="form-row">
        <div className="form-col-xxl">
          <TextAreaField {...getFieldProps('projectProgram')} />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectProgramSection);
