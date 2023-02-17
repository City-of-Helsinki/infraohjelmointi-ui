import { FC, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { Paragraph, ProgressCircle } from '@/components/shared';
import { dirtyFieldsToRequestObject, objectHasProperty } from '@/utils/common';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { selectProject, silentPatchProjectThunk } from '@/reducers/projectSlice';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { HookFormControlType, IAppForms, IProjectHeaderForm } from '@/interfaces/formInterfaces';
import ProjectNameFields from './ProjectNameFields';
import useProjectHeaderForm from '@/forms/useProjectHeaderForm';
import ProjectPhaseField from './ProjectPhaseField';
import ProjectFavouriteField from './ProjectFavouriteField';
import { selectUser } from '@/reducers/authSlice';

export interface IProjectHeaderFieldProps {
  control: HookFormControlType;
}

const ProjectHeader: FC = () => {
  const project = useAppSelector(selectProject);
  const projectId = project?.id;
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const group = 'Hakaniemi';

  const { formMethods } = useProjectHeaderForm();

  const {
    formState: { dirtyFields, isDirty },
    control,
    handleSubmit,
  } = formMethods;

  const onSubmit: SubmitHandler<IProjectHeaderForm> = useCallback(
    async (form: IProjectHeaderForm) => {
      if (isDirty) {
        const data: IProjectRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);

        if (objectHasProperty(data, 'favourite')) {
          // Set favourite persons as a set to include user ID and filter it away if the user de-selected it as a favourite
          data.favPersons = Array.from(
            new Set<string>([...(project?.favPersons || []), user?.id || '']),
          ).filter((fp) => (!form.favourite ? fp !== user?.id : fp));

          delete data.favourite;
        }

        projectId && (await dispatch(silentPatchProjectThunk({ id: projectId, data: data })));
      }
    },
    [project?.favPersons, projectId, user?.id, dispatch, dirtyFields, isDirty],
  );

  return (
    <form onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}>
      <div className="project-header-container">
        <div className="left">
          <div className="left-wrapper">
            <div className="readiness-container">
              <ProgressCircle color={'--color-engel'} percent={project?.projectReadiness} />
            </div>
          </div>
        </div>
        <div className="center">
          <div className="center-wrapper">
            <ProjectNameFields control={control} />
            <ProjectPhaseField control={control} />
          </div>
        </div>
        <div className="right">
          <div className="right-wrapper">
            <div className="right-wrapper-inner">
              <div className="favourite-button-container">
                <ProjectFavouriteField control={control} />
              </div>
              <Paragraph color="white" size="m" text={'inGroup'} />
              <Paragraph color="white" size="l" fontWeight="bold" text={group} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProjectHeader;
