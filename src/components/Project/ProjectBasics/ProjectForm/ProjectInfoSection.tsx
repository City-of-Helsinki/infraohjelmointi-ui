import { FormSectionTitle, NumberField, SelectField, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { IProject } from '@/interfaces/projectInterfaces';
import { FC, memo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { ProjectHashTags } from './ProjectHashTags';
import { validateMaxLength, validateRequired } from '@/utils/validation';
import { useAppSelector } from '@/hooks/common';
import { selectIsProjectSaving } from '@/reducers/projectSlice';

interface IProjectInfoSectionProps {
  project: IProject | null;
  control: Control<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
}

const ProjectInfoSection: FC<IProjectInfoSectionProps> = ({ project, getFieldProps, control }) => {
  const areas = useOptions('areas');
  const types = useOptions('types');
  const { t } = useTranslation();

  const isSaving = useAppSelector(selectIsProjectSaving);

  return (
    <div className="w-full" id="basics-info-section">
      <FormSectionTitle {...getFieldProps('basics')} />
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('type')}
            options={types}
            rules={{ required: t('validation.required', { field: t('validation.phase') }) ?? '' }}
          />
        </div>
        <div className="form-col-xl">
          <NumberField {...getFieldProps('hkrId')} rules={validateMaxLength(5, t)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <TextField {...getFieldProps('entityName')} rules={validateMaxLength(30, t)} />
        </div>
        <div className="form-col-xl">
          <TextField
            {...getFieldProps('sapProject')}
            control={control}
            rules={validateMaxLength(15, t)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField {...getFieldProps('area')} options={areas} />
        </div>
        <div className="form-col-xl">
          <TextField
            {...getFieldProps('sapNetwork')}
            readOnly={true}
            rules={validateMaxLength(15, t)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <TextAreaField
            {...getFieldProps('description')}
            size="l"
            rules={validateRequired('description', t)}
            formSaved={isSaving}
          />
        </div>
      </div>
      <div className="form-row">
        <ProjectHashTags
          name="hashTags"
          label={'projectForm.hashTags'}
          control={control}
          project={project}
        />
      </div>
    </div>
  );
};

export default memo(ProjectInfoSection);
