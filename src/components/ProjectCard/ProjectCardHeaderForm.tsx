import { FC, useCallback } from 'react';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { Paragraph, ProgressCircle } from '@/components/shared';
import {
  dirtyFieldsToRequestObject,
  emptyStringsToNull,
  getOptionId,
  objectHasProperty,
} from '@/utils/common';
import { IProjectCardRequest } from '@/interfaces/projectCardInterfaces';
import { silentPatchProjectCardThunk } from '@/reducers/projectCardSlice';
import { SubmitHandler } from 'react-hook-form';
import ProjectCardNameFields from './ProjectCardNameFields';
import useProjectCardHeaderForm from '@/hooks/useProjectCardHeaderForm';
import ProjectCardPhaseField from './ProjectCardPhaseField';
import ProjectCardFavouriteField from './ProjectCardFavouriteField';
import {
  FormSubmitEventType,
  HookFormControlType,
  IAppForms,
  IProjectCardHeaderForm,
} from '@/interfaces/formInterfaces';
import _ from 'lodash';

export interface IProjectCardHeaderFieldProps {
  control: HookFormControlType;
  handleSave: FormSubmitEventType;
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

  const { control, handleSubmit, dirtyFields } = useProjectCardHeaderForm();

  const onSubmit: SubmitHandler<IProjectCardHeaderForm> = useCallback(
    async (form: IProjectCardHeaderForm) => {
      const data: IProjectCardRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);

      if (objectHasProperty(data, 'favourite')) {
        // Set favourite persons as a set to include user ID and filter it away if the user de-selected it as a favourite
        data.favPersons = Array.from(
          new Set<string>([...(projectCard?.favPersons || []), user?.id || '']),
        ).filter((fp) => (!form.favourite ? fp !== user?.id : fp));

        delete data.favourite;
      }

      projectId && (await dispatch(silentPatchProjectCardThunk({ id: projectId, data: data })));
    },
    [projectCard?.favPersons, projectId, user?.id, dispatch, dirtyFields],
  );

  const formFieldProps = { control, handleSave: handleSubmit(onSubmit) };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            <ProjectCardNameFields {...formFieldProps} />
            <ProjectCardPhaseField {...formFieldProps} />
          </div>
        </div>
        <div className="right">
          <div className="right-wrapper">
            <div className="right-wrapper-inner">
              <div className="favourite-button-container">
                <ProjectCardFavouriteField {...formFieldProps} />
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
