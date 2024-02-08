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
import { selectIsProjectSaving, selectProjectMode } from '@/reducers/projectSlice';

interface IProjectInfoSectionProps {
  project: IProject | null;
  control: Control<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isInputDisabled: boolean;
  projectMode: "edit" | "new";
}

const ProjectInfoSection: FC<IProjectInfoSectionProps> = ({
  project,
  getFieldProps,
  control,
  isInputDisabled,
}) => {
  const areas = useOptions('areas');
  const types = useOptions('types');
  const { t } = useTranslation();
  const projectMode = useAppSelector(selectProjectMode);

  const isSaving = useAppSelector(selectIsProjectSaving);

  return (
    <div className="w-full" id="basics-info-section">
      <FormSectionTitle {...getFieldProps('basics')} />
      <div className="form-row">
        <div className="form-col-xl">
          {projectMode === 'new' && (
            <TextField
              {...getFieldProps('name')}
              rules={{ ...validateMaxLength(200, t), ...validateRequired('name', t) }}
            />
          )}
          <SelectField
            {...getFieldProps('type')}
            options={types}
            disabled={isInputDisabled}
            rules={{ required: t('validation.required', { field: t('validation.phase') }) ?? '' }}
          />
        </div>
        <div className="form-col-xl">
          <NumberField
            {...getFieldProps('hkrId')}
            rules={validateMaxLength(5, t)}
            disabled={isInputDisabled}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <TextField
            {...getFieldProps('entityName')}
            rules={validateMaxLength(30, t)}
            disabled={isInputDisabled}
          />
        </div>
        <div className="form-col-xl">
          <TextField
            {...getFieldProps('sapProject')}
            control={control}
            rules={validateMaxLength(15, t)}
            disabled={isInputDisabled}
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
          projectMode={projectMode}
        />
      </div>
    </div>
  );
};

export default memo(ProjectInfoSection);
