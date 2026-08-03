import { memo } from 'react';
import { FieldPath, FormProvider } from 'react-hook-form';
import { FormSectionTitle, TextField } from '@/components/shared';
import { useTranslation } from 'react-i18next';
import useProjectProgrammeForm, { IProjectProgrammeForm } from '@/forms/useProjectProgrammeForm';
import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';

export function getFieldProps(name: FieldPath<IProjectProgrammeForm>) {
  return {
    name,
    label: `projectProgrammeForm.${name}`,
  };
}

interface IProjectProgrammeFormProps {
  basicInfo: IProjectProgrammeBasicInfo | null;
}

function ProjectProgrammeForm({ basicInfo }: Readonly<IProjectProgrammeFormProps>) {
  const { t } = useTranslation();
  const formMethods = useProjectProgrammeForm(basicInfo);

  return (
    <FormProvider {...formMethods}>
      <form className="project-form mx-auto max-w-xl" data-testid="project-programme-basic-info-form">
        <div className="mb-12">
          <FormSectionTitle
            name="projectProgrammeBasicInfo"
            label="projectProgrammeForm.basicInfoSectionTitle"
          />
          <p className="mb-8">{t('projectProgrammeForm.basicInfoSectionText')}</p>
          <TextField {...getFieldProps('name')} size="full" />
          <TextField {...getFieldProps('district')} size="full" />
        </div>
      </form>
    </FormProvider>
  );
}

export default memo(ProjectProgrammeForm);
