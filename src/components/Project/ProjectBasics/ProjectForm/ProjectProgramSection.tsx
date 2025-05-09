import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { FC, memo } from 'react';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';

interface IProjectProgramSectionProps {
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isUserOnlyViewer: boolean;
}
const ProjectProgramSection: FC<IProjectProgramSectionProps> = ({ getFieldProps, isUserOnlyViewer }) => {
  

  return (
    <div className="w-full" id="basics-location-section">
      <FormSectionTitle {...getFieldProps('projectProgramTitle')} />
      <div className="form-row">
        <div className="form-col-xxl">
          <TextAreaField {...getFieldProps('projectProgram')} readOnly={isUserOnlyViewer}/>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectProgramSection);
