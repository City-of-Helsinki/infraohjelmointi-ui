import { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { ProgressCircle } from '@/components/shared';
import { dirtyFieldsToRequestObject, mapIconKey } from '@/utils/common';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { selectProject, setIsSaving, setSelectedProject } from '@/reducers/projectSlice';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { HookFormControlType, IAppForms, IProjectHeaderForm } from '@/interfaces/formInterfaces';
import ProjectNameFields from './ProjectNameFields';
import useProjectHeaderForm from '@/forms/useProjectHeaderForm';
import ProjectFavouriteField from './ProjectFavouriteField';
import { selectUser } from '@/reducers/authSlice';
import { useTranslation } from 'react-i18next';
import { patchProject } from '@/services/projectServices';
import { selectPlanningGroups } from '@/reducers/groupSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { isUserOnlyViewer } from '@/utils/userRoleHelpers';
import optionIcon from '@/utils/optionIcon';

export interface IProjectHeaderFieldProps {
  control: HookFormControlType;
}

const ProjectHeader: FC = () => {
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectProject);
  const user = useAppSelector(selectUser);
  const groups = useAppSelector(selectPlanningGroups);
  const { t } = useTranslation();
  const { formMethods } = useProjectHeaderForm();
  const isOnlyViewer = isUserOnlyViewer(user);

  const projectGroupName = useMemo(() => {
    return project?.projectGroup
      ? groups.find((g) => g.id === project.projectGroup)?.name ?? ''
      : '';
  }, [groups, project?.projectGroup]);

  const {
    formState: { dirtyFields, isDirty },
    control,
    handleSubmit,
    getValues,
  } = formMethods;

  const [iconKey, setIconKey] = useState(mapIconKey(getValues('phase').label));
  const [icon, setIcon] = useState(optionIcon[iconKey as keyof typeof optionIcon]);
  const onSubmit: SubmitHandler<IProjectHeaderForm> = useCallback(
    async (form: IProjectHeaderForm) => {
      if (isDirty) {
        dispatch(setIsSaving(true));
        const data: IProjectRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);

        if ('favourite' in data) {
          // Set favourite persons as a set to include user ID and filter it away if the user de-selected it as a favourite
          data.favPersons = Array.from(
            new Set<string>([...(project?.favPersons ?? []), user?.uuid ?? '']),
          ).filter((fp) => (!form.favourite ? fp !== user?.uuid : fp));

          delete data.favourite;
        }

        if (project?.id) {
          try {
            const response = await patchProject({ id: project?.id, data });
            if (response.status === 200) {
              dispatch(setSelectedProject(response.data));
              dispatch(setIsSaving(false));
            }
          } catch (error) {
            console.log('project patch error: ', error);
            dispatch(setIsSaving(false));
            dispatch(
              notifyError({
                message: 'formSaveError',
                title: 'saveError',
                type: 'notification',
              }),
            );
            return;
          }
        }
      }
    },
    [isDirty, dispatch, dirtyFields, project?.id, project?.favPersons, user?.uuid],
  );

  useEffect(() => {
    const phaseLabel = getValues('phase').label;
    const newIconKey = mapIconKey(phaseLabel);
    setIconKey(newIconKey);
    setIcon(optionIcon[newIconKey as keyof typeof optionIcon]);
  }, [getValues]);

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
            <div className="project-header-phase">
              <div className="project-header-icon">{icon}</div>
              <div>{t(`option.${getValues('phase').label}`)}</div>
            </div>
          </div>
        </div>
        <div className="mr-3 flex-1" data-testid="project-header-right">
          <div className="flex h-full flex-col">
            <div className="mr-auto text-right">
              {/*The viewers can't access any other views than planning view and the project card
              so by default they also can't access the place where the favourite projects would
              be. Also, the whole feature is not yet implemented.*/}
              {!isOnlyViewer && (
                <div className="mb-8" data-testid="project-favourite">
                  <ProjectFavouriteField control={control} />
                </div>
              )}
              <p className="text-white">{t('inGroup')}</p>
              <p className="text-l font-bold text-white">{projectGroupName}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProjectHeader;
