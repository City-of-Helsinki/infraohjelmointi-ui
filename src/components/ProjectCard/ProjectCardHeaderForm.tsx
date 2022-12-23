import { FC, useCallback } from 'react';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { Paragraph, ProgressCircle } from '@/components/shared';
import { dirtyFieldsToRequestObject, objectHasProperty } from '@/utils/common';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import { silentPatchProjectCardThunk } from '@/reducers/projectCardSlice';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import ProjectCardNameFields from './ProjectCardNameFields';
import useProjectCardHeaderForm from '@/hooks/useProjectCardHeaderForm';
import ProjectCardPhaseField from './ProjectCardPhaseField';
import ProjectCardFavouriteField from './ProjectCardFavouriteField';
import {
  HookFormControlType,
  IAppForms,
  IProjectCardHeaderForm,
} from '@/interfaces/formInterfaces';
import _ from 'lodash';

export interface IProjectCardHeaderFieldProps {
  control: HookFormControlType;
}

const ProjectCardHeaderForm: FC = () => {
  const projectCard = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard,
    _.isEqual,
  );
  const projectId = projectCard?.id;
  const user = useAppSelector((state: RootState) => state.auth.user, _.isEqual);
  const dispatch = useAppDispatch();
  const group = 'Hakaniemi';

  const { formMethods } = useProjectCardHeaderForm();

  const {
    formState: { dirtyFields, isDirty },
    control,
    handleSubmit,
  } = formMethods;

  const onSubmit: SubmitHandler<IProjectCardHeaderForm> = useCallback(
    async (form: IProjectCardHeaderForm) => {
      if (isDirty) {
        const data: IProjectCardRequest = dirtyFieldsToRequestObject(
          dirtyFields,
          form as IAppForms,
        );

        if (objectHasProperty(data, 'favourite')) {
          // Set favourite persons as a set to include user ID and filter it away if the user de-selected it as a favourite
          data.favPersons = Array.from(
            new Set<string>([...(projectCard?.favPersons || []), user?.id || '']),
          ).filter((fp) => (!form.favourite ? fp !== user?.id : fp));

          delete data.favourite;
        }

        projectId && (await dispatch(silentPatchProjectCardThunk({ id: projectId, data: data })));
      }
    },
    [projectCard?.favPersons, projectId, user?.id, dispatch, dirtyFields, isDirty],
  );

  return (
    <form onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}>
      <div className="project-card-header-container">
        <div className="left">
          <div className="left-wrapper">
            <div className="readiness-container">
              <ProgressCircle color={'--color-engel'} percent={projectCard?.projectReadiness} />
            </div>
          </div>
        </div>
        <div className="center">
          <div className="center-wrapper">
            <ProjectCardNameFields control={control} />
            <ProjectCardPhaseField control={control} />
          </div>
        </div>
        <div className="right">
          <div className="right-wrapper">
            <div className="right-wrapper-inner">
              <div className="favourite-button-container">
                <ProjectCardFavouriteField control={control} />
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

export default ProjectCardHeaderForm;
