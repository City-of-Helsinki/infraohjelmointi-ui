import { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { dirtyFieldsToRequestObject, mapIconKey } from '@/utils/common';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { selectProject, setIsSaving, setSelectedProject } from '@/reducers/projectSlice';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { HookFormControlType, IAppForms, IProjectHeaderForm } from '@/interfaces/formInterfaces';
import ProjectNameFields from './ProjectNameFields';
import useProjectHeaderForm from '@/forms/useProjectHeaderForm';
import { selectUser } from '@/reducers/authSlice';
import { useTranslation } from 'react-i18next';
import { patchProject } from '@/services/projectServices';
import { selectPlanningGroups } from '@/reducers/groupSlice';
import { notifyError } from '@/reducers/notificationSlice';
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

  const projectGroupName = useMemo(() => {
    return project?.projectGroup
      ? groups.find((g) => g.id === project.projectGroup)?.name ?? ''
      : '';
  }, [groups, project?.projectGroup]);

  const {
    formState: { dirtyFields, isDirty },
    control,
    watch,
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

  const phase = watch('phase');
  const projectHeaderPhaseString = getValues('phase')?.label
    ? t(`option.${getValues('phase').label}`)
    : '';

  useEffect(() => {
    const newIconKey = mapIconKey(phase?.label);
    setIconKey(newIconKey);
    setIcon(optionIcon[newIconKey as keyof typeof optionIcon]);
  }, [phase]);

  return (
    <form onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}>
      <div className="project-header-container" data-testid="project-header">
        <div
          className="flex-[3] pl-[var(--spacing-m)] md:pl-[12rem]"
          data-testid="project-header-center"
        >
          <div
            className="project-header-phase-select-container"
            data-testid="project-header-name-fields"
          >
            <ProjectNameFields control={control} />
            {projectHeaderPhaseString && (
              <div className="project-header-phase">
                <div className="project-header-icon">{icon}</div>
                <div>
                  {projectHeaderPhaseString}
                  {project?.phase?.value === 'suspended' &&
                    project?.suspendedDate &&
                    project?.suspendedFromPhase && (
                      <span className="project-header-suspended">
                        {' — '}
                        {t('projectCard.suspended', {
                          phase: t(`option.${project.suspendedFromPhase.value}`),
                          date: project.suspendedDate,
                        })}
                      </span>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mr-3 flex-1" data-testid="project-header-right">
          <div className="flex h-full flex-col">
            <div className="mr-auto text-right">
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
