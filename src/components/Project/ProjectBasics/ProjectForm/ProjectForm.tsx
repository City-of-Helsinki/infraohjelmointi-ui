import useProjectForm from '@/forms/useProjectForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectForm } from '@/interfaces/formInterfaces';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  setIsNewProject,
  selectIsNewProject,
  selectProject,
  setIsSaving,
  setSelectedProject,
} from '@/reducers/projectSlice';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import { patchProject, postProject } from '@/services/projectServices';
import ProjectStatusSection from './ProjectStatusSection';
import ProjectInfoSection from './ProjectInfoSection';
import ProjectScheduleSection from './ProjectScheduleSection';
import ProjectFinancialSection from './ProjectFinancialSection';
import ProjectResponsiblePersonsSection from './ProjectResponsiblePersonsSection';
import ProjectLocationSection from './ProjectLocationSection';
import ProjectProgramSection from './ProjectProgramSection';
import ProjectFormBanner from './ProjectFormBanner';
import usePromptConfirmOnNavigate from '@/hooks/usePromptConfirmOnNavigate';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import _ from 'lodash';
import './styles.css';

const ProjectForm = () => {
  const { formMethods, classOptions, locationOptions } = useProjectForm();
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const isNewProject = useAppSelector(selectIsNewProject);
  const navigate = useNavigate();

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
    control,
    getValues,
  } = formMethods;

  usePromptConfirmOnNavigate({
    title: t('confirmLeaveTitle'),
    description: t('confirmLeaveDescription'),
    when: isDirty,
  });

  const [newProjectId, setNewProjectId] = useState<string>('');

  useEffect(() => {
    if (!isDirty && newProjectId) {
      navigate(`/project/${newProjectId}/basics`);
    }
  }, [newProjectId, isDirty]);
  const onSubmit = useCallback(
    async (form: IProjectForm) => {
      if (isDirty) {
        dispatch(setIsSaving(true));

        const data: IProjectRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);

        if (project?.id) {
          try {
            await patchProject({ id: project.id, data });
          } catch (error) {
            console.log('project patch error: ', error);
          } finally {
            dispatch(setIsSaving(false));
          }
        }

        if (!project?.id && isNewProject) {
          // post project
          // set saving false
          // navigate to basics
          console.log('POSTING PROJECT', data);
          let postResponsePId = '';
          try {
            const response = await postProject({ data });
            dispatch(setSelectedProject(response));
            postResponsePId = response.id;
          } catch (error) {
            console.log('project post error: ', error);
          } finally {
            dispatch(setIsSaving(false));
            setNewProjectId(postResponsePId);
            dispatch(setIsNewProject(false));
          }
        }
      }
    },
    [isDirty, project?.id, dirtyFields, dispatch, isNewProject, navigate],
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

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Listens to forms onClick events and checks if a datepicker is opened
  useEffect(() => {
    const formElement = formRef?.current;

    if (!formElement) {
      return;
    }

    const checkIfDatePickerOpened = () => {
      const dateFields = document.getElementsByClassName('date-input');

      if (dateFields.length > 0) {
        // The date picker doesn't have any id we can give it nor a distinguishable class name so we need to look through
        // all the date fields and see if one has the date picker open
        const datePickers = Array.from(dateFields).filter(
          (df) => df?.children[1]?.children[2] !== undefined,
        );

        setDatePickerVisible(datePickers.length > 0);
      }
    };

    formElement.addEventListener('click', checkIfDatePickerOpened);
    return () => {
      formElement.removeEventListener('click', checkIfDatePickerOpened);
    };
  }, []);

  const submitCallback = useCallback(() => {
    // We disable onBlur events when the datepicker is opened because it messes up with the HDS DateInput's DatePicker
    if (datePickerVisible) {
      return undefined;
    }

    return handleSubmit(onSubmit);
  }, [handleSubmit, onSubmit, datePickerVisible]);

  return (
    <form
      ref={formRef}
      onBlur={submitCallback()}
      data-testid="project-form"
      className="project-form"
    >
      {/* SECTION 1 - BASIC INFO */}
      <ProjectInfoSection {...formProps} project={project} />
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
