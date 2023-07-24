import { FC, useCallback } from 'react';
import { useAppSelector } from '@/hooks/common';
import { ProgressCircle, SelectField } from '@/components/shared';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { selectProjectMode, selectProject } from '@/reducers/projectSlice';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { HookFormControlType, IAppForms, IProjectHeaderForm } from '@/interfaces/formInterfaces';
import ProjectNameFields from './ProjectNameFields';
import useProjectHeaderForm from '@/forms/useProjectHeaderForm';
import ProjectFavouriteField from './ProjectFavouriteField';
import { selectUser } from '@/reducers/authSlice';
import { useOptions } from '@/hooks/useOptions';
import { useTranslation } from 'react-i18next';
import { patchProject } from '@/services/projectServices';
import _ from 'lodash';

export interface IProjectHeaderFieldProps {
  control: HookFormControlType;
}

const ProjectHeader: FC = () => {
  const project = useAppSelector(selectProject);
  const projectId = project?.id;
  const user = useAppSelector(selectUser);
  const group = 'Hakaniemi';
  const { t } = useTranslation();
  const projectMode = useAppSelector(selectProjectMode);
  const { formMethods } = useProjectHeaderForm();

  const {
    formState: { dirtyFields, isDirty },
    control,
    handleSubmit,
    getValues,
  } = formMethods;

  const phases = useOptions('phases');

  const onSubmit: SubmitHandler<IProjectHeaderForm> = useCallback(
    async (form: IProjectHeaderForm) => {
      if (isDirty) {
        const data: IProjectRequest = dirtyFieldsToRequestObject(
          dirtyFields,
          form as IAppForms,
          project,
        );

        if (_.has(data, 'favourite')) {
          // Set favourite persons as a set to include user ID and filter it away if the user de-selected it as a favourite
          data.favPersons = Array.from(
            new Set<string>([...(project?.favPersons ?? []), user?.id ?? '']),
          ).filter((fp) => (!form.favourite ? fp !== user?.id : fp));

          delete data.favourite;
        }

        projectId && (await patchProject({ id: projectId, data: data }));
      }
    },
    [project?.favPersons, projectId, user?.id, dirtyFields, isDirty],
  );

  return (
    <form onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}>
      <div className="project-header-container" data-testid="project-header">
        <div className="flex-1" data-testid="project-header-left">
          <div className="flex h-full justify-end">
            <div className=" h-full max-w-[6rem]">
              <ProgressCircle color={'--color-engel'} percent={project?.projectReadiness} />
            </div>
          </div>
        </div>
        <div className="flex-[3]" data-testid="project-header-center">
          <div
            className="project-header-phase-select-container"
            data-testid="project-header-name-fields"
          >
            <ProjectNameFields control={control} />
            <SelectField
              disabled={projectMode === 'new'}
              name="phase"
              control={control}
              options={phases}
              iconKey={getValues('phase').label}
            />
          </div>
        </div>
        <div className="mr-3 flex-1" data-testid="project-header-right">
          <div className="flex h-full flex-col">
            <div className="mr-auto text-right">
              <div className="mb-8" data-testid="project-favourite">
                <ProjectFavouriteField control={control} />
              </div>
              <p className="text-white">{t('inGroup')}</p>
              <p className="text-l font-bold text-white">{group}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProjectHeader;
