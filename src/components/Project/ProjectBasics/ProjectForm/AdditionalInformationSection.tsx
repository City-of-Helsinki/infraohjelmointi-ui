import { FormSectionTitle } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { FC, memo } from 'react';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';

interface IAdditionalInformationSectionProps {
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isUserOnlyViewer: boolean;
}

const AdditionalInformationSection: FC<IAdditionalInformationSectionProps> = ({
  getFieldProps,
  isUserOnlyViewer,
}) => {
  return (
    <div className="w-full" id="additionalInformation">
      <FormSectionTitle {...getFieldProps('additionalInformationTitle')} />
      <div className="form-row">
        <div className="form-col-xxl">
          <TextAreaField {...getFieldProps('additionalInformation')} readOnly={isUserOnlyViewer} />
        </div>
      </div>
    </div>
  );
};

export default memo(AdditionalInformationSection);
