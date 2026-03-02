import { FormSectionTitle, NumberField, SelectField, TextField } from '@/components/shared';
import TextAreaField from '@/components/shared/TextAreaField';
import { IProject } from '@/interfaces/projectInterfaces';
import { FC, memo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { ProjectHashTags } from './ProjectHashTags';
import { validateMaxLength, validateRequired, validateRequiredSelect } from '@/utils/validation';
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
  getValues: UseFormGetValues<IProjectForm>;
  isInputDisabled: boolean;
  projectMode: 'edit' | 'new';
  isUserOnlyViewer: boolean;
}

const ProjectInfoSection: FC<IProjectInfoSectionProps> = ({
  project,
  getFieldProps,
  control,
  isInputDisabled,
  isUserOnlyViewer,
}) => {
  const types = useOptions('types');
  const typeQualifiers = useOptions('typeQualifiers');
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
            required
            rules={validateRequiredSelect('type', t)}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-xl">
          <NumberField
            {...getFieldProps('hkrId')}
            rules={validateMaxLength(5, t)}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('typeQualifier')}
            options={typeQualifiers}
            required
            rules={validateRequiredSelect('typeQualifier', t)}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-xl">
          <TextField
            {...getFieldProps('sapProject')}
            control={control}
            rules={validateMaxLength(15, t)}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <TextAreaField
            testId="project-form-description"
            {...getFieldProps('description')}
            size="l"
            rules={{ ...validateMaxLength(1000, t), ...validateRequired('description', t) }}
            formSaved={isSaving}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      {projectMode === 'new' && (
        <>
          <div className="form-row">
            <div className="form-col-xl">
              <TextField
                {...getFieldProps('address')}
                rules={{ ...validateRequired('address', t) }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col-xl">
              <TextField {...getFieldProps('postalCode')} />
            </div>
            <div className="form-col-xl">
              <TextField {...getFieldProps('city')} />
            </div>
          </div>
        </>
      )}
      <div className="form-row">
        <ProjectHashTags
          name="hashTags"
          label={'projectForm.hashTags'}
          control={control}
          project={project}
          projectMode={projectMode}
          readOnly={isUserOnlyViewer}
        />
      </div>
    </div>
  );
};

export default memo(ProjectInfoSection);
