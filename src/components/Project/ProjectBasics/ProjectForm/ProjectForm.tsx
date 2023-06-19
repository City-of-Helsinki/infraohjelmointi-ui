import useProjectForm from '@/forms/useProjectForm';
import { useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectForm } from '@/interfaces/formInterfaces';
import { Dispatch, FC, SetStateAction, memo, useCallback, useMemo, useState } from 'react';
import { selectProject } from '@/reducers/projectSlice';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import { useOptions } from '@/hooks/useOptions';
import { patchProject } from '@/services/projectServices';
import ProjectStatusSection from './ProjectStatusSection';
import ProjectInfoSection from './ProjectInfoSection';
import ProjectScheduleSection from './ProjectScheduleSection';
import ProjectFinancialSection from './ProjectFinancialSection';
import ProjectResponsiblePersonsSection from './ProjectResponsiblePersonsSection';
import ProjectLocationSection from './ProjectLocationSection';
import ProjectProgramSection from './ProjectProgramSection';
import ProjectFormBanner from './ProjectFormBanner';
import _ from 'lodash';
import './styles.css';

interface IProjectFormProps {
  setIsSaving: Dispatch<SetStateAction<boolean>>;
}
const ProjectForm: FC<IProjectFormProps> = ({ setIsSaving }) => {
  const { formMethods, classOptions, locationOptions } = useProjectForm();
  const project = useAppSelector(selectProject);
  const [formSaved, setFormSaved] = useState(false);

  const {
    formState: { dirtyFields, isDirty, errors },
    handleSubmit,
    control,
    getValues,
  } = formMethods;

  const phases = useOptions('phases');

  const handleSetFormSaved = useCallback((value: boolean) => {
    setFormSaved(value);
  }, []);

  const onSubmit = useCallback(
    async (form: IProjectForm) => {
      if (isDirty) {
        console.log('is saving with data: ', form);

        setIsSaving(true);
        if (!project?.id) {
          return;
        }
        const data: IProjectRequest = dirtyFieldsToRequestObject(
          dirtyFields,
          form as IAppForms,
          phases,
        );

        await patchProject({ id: project.id, data })
          .then(() => {
            handleSetFormSaved(true);
            setTimeout(() => {
              handleSetFormSaved(false);
            }, 0);
          })
          .catch((e) => console.log('project patch error: ', e))
          .finally(() => setIsSaving(false));
      }
    },
    [isDirty, setIsSaving, project?.id, dirtyFields, phases, handleSetFormSaved],
  );

  const getFieldProps = useCallback(
    (name: string) => {
      return {
        name: name,
        label: `projectForm.${name}`,
        control: control,
      };
    },
    [control],
  );

  const formProps = useMemo(
    () => ({
      getFieldProps,
      control,
      getValues,
    }),
    [control, getFieldProps, getValues],
  );

  const submitCallback = useCallback(
    () => handleSubmit(onSubmit),
    [handleSubmit, onSubmit, errors],
  );

  const autoSubmit = useCallback(() => {
    if (_.isEmpty(errors)) {
      console.log('autosubmitting');

      return handleSubmit(onSubmit);
    }
    // TODO: evaluate errors onBlur, it only evaluates whichever field is typed in...
    return undefined;
  }, [handleSubmit, onSubmit, errors]);

  return (
    <form onBlur={autoSubmit()} data-testid="project-form" className="project-form">
      {/* SECTION 1 - BASIC INFO */}
      <ProjectInfoSection {...formProps} project={project} formSaved={formSaved} />
      {/* SECTION 2 - STATUS */}
      <ProjectStatusSection {...formProps} />
      {/* SECTION 3 - SCHEDULE */}
      <ProjectScheduleSection {...formProps} />
      {/* SECTION 4 - FINANCIALS */}
      <ProjectFinancialSection {...formProps} classOptions={classOptions} />
      {/* SECTION 5 - RESPONSIBLE PERSONS */}
      <ProjectResponsiblePersonsSection {...formProps} />
      {/* SECTION 6 - LOCATION */}
      <ProjectLocationSection {...formProps} locationOptions={locationOptions} />
      {/* SECTION 7 - PROJECT PROGRAM */}
      <ProjectProgramSection {...formProps} />
      {/* BANNER */}
      <ProjectFormBanner onSubmit={submitCallback} isDirty={isDirty} />
    </form>
  );
};

export default memo(ProjectForm);
