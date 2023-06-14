import useProjectForm from '@/forms/useProjectForm';
import { useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectForm } from '@/interfaces/formInterfaces';
import { FC, memo, useCallback, useMemo, useState } from 'react';
import { selectProject } from '@/reducers/projectSlice';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { useOptions } from '@/hooks/useOptions';
import { patchProject } from '@/services/projectServices';
import ProjectStatusSection from './ProjectStatusSection';
import ProjectInfoSection from './ProjectInfoSection';
import ProjectScheduleSection from './ProjectScheduleSection';
import ProjectFinancialsSection from './ProjectFinancialsSection';
import ProjectResponsiblePersonsSection from './ProjectResponsiblePersonsSection';
import ProjectLocationSection from './ProjectLocationSection';
import ProjectProgramSection from './ProjectProgramSection';
import _ from 'lodash';
import './styles.css';

const ProjectForm: FC = () => {
  const { formMethods, classOptions, locationOptions } = useProjectForm();
  const project = useAppSelector(selectProject);
  const [formSaved, setFormSaved] = useState(false);

  const {
    formState: { dirtyFields, isDirty },
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
      console.log('attempt submit');

      if (isDirty) {
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
          .catch(Promise.reject);
      }
    },
    [isDirty, project?.id, dirtyFields, phases, handleSetFormSaved],
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

  const isFieldDirty = useCallback(
    (field: string) => {
      if (_.has(dirtyFields, field)) {
        return dirtyFields[field as keyof IProjectForm];
      }
    },
    [dirtyFields],
  );

  const formProps = useMemo(
    () => ({
      getFieldProps,
      control,
      getValues,
      isFieldDirty,
    }),
    [control, getFieldProps, getValues, isFieldDirty],
  );

  return (
    <form
      onBlur={handleSubmit(onSubmit) as SubmitHandler<FieldValues>}
      data-testid="project-form"
      className="project-form"
    >
      {/* SECTION 1 - BASIC INFO */}
      <ProjectInfoSection {...formProps} project={project} formSaved={formSaved} />
      {/* SECTION 2 - STATUS */}
      <ProjectStatusSection {...formProps} />
      {/* SECTION 3 - SCHEDULE */}
      <ProjectScheduleSection {...formProps} />
      {/* SECTION 4 - FINANCIALS */}
      <ProjectFinancialsSection {...formProps} classOptions={classOptions} />
      {/* SECTION 5 - RESPONSIBLE PERSONS */}
      <ProjectResponsiblePersonsSection {...formProps} />
      {/* SECTION 6 - LOCATION */}
      <ProjectLocationSection {...formProps} locationOptions={locationOptions} />
      {/* SECTION 7 - PROJECT PROGRAM */}
      <ProjectProgramSection {...formProps} />
    </form>
  );
};

export default memo(ProjectForm);
