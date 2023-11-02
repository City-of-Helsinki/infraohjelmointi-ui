import useProjectForm from '@/forms/useProjectForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectForm } from '@/interfaces/formInterfaces';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  selectProjectMode,
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
import { canUserEditProjectFormField } from '@/utils/validation';
import { selectUser } from '@/reducers/authSlice';
import { getProjectSapCosts } from '@/reducers/sapCostSlice';

const ProjectForm = () => {
  const { formMethods, classOptions, locationOptions, selectedMasterClassName } = useProjectForm();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);
  const project = useAppSelector(selectProject);
  const projectMode = useAppSelector(selectProjectMode);
  const sapCosts = useAppSelector(getProjectSapCosts);

  const [newProjectId, setNewProjectId] = useState('');

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

  // useEffect which triggers when form fields are reset by setting selectedProject after successful POST request
  useEffect(() => {
    if (projectMode !== 'new') {
      return;
    }

    if (!isDirty && newProjectId) {
      navigate(`/project/${newProjectId}/basics`);
      setNewProjectId('');
    }
  }, [isDirty, newProjectId]);

  const onSubmit = useCallback(
    async (form: IProjectForm) => {
      if (isDirty) {
        dispatch(setIsSaving(true));

        const data: IProjectRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);

        // Patch project
        if (project?.id && projectMode === 'edit') {
          try {
            await patchProject({ id: project?.id, data });
          } catch (error) {
            console.log('project patch error: ', error);
          }
        }

        // Post project
        if (projectMode === 'new') {
          try {
            dispatch(setIsSaving(true));
            const response = await postProject({ data });
            dispatch(setSelectedProject(response));
            setNewProjectId(response.id);
          } catch (error) {
            console.log('project post error: ', error);
          }
        }

        dispatch(setIsSaving(false));
      }
    },
    [isDirty, project?.id, dirtyFields, dispatch, projectMode, navigate],
  );

  const getFieldProps = useCallback(
    (name: string) => {
      return {
        name: name,
        label: `projectForm.${name}`,
        control: control,
        sapCosts: project ? sapCosts[project?.id] : null,
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
    const document = window.document;

    if (!document) {
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

    document.addEventListener('click', checkIfDatePickerOpened);
    return () => {
      document.removeEventListener('click', checkIfDatePickerOpened);
    };
  }, []);

  const submitCallback = useCallback(() => {
    // We disable onBlur events when the datepicker is opened because it messes up with the HDS DateInput's DatePicker
    if (datePickerVisible) {
      return undefined;
    }

    return handleSubmit(onSubmit);
  }, [handleSubmit, onSubmit, datePickerVisible]);

  const isInputDisabled = useMemo(
    () => canUserEditProjectFormField(selectedMasterClassName, user),
    [selectedMasterClassName, user],
  );

  return (
    <form
      onBlur={projectMode !== 'new' ? submitCallback() : undefined}
      data-testid="project-form"
      className="project-form"
    >
      {/* SECTION 1 - BASIC INFO */}
      <ProjectInfoSection {...formProps} project={project} isInputDisabled={isInputDisabled} />
      {/* SECTION 2 - STATUS */}
      <ProjectStatusSection {...formProps} isInputDisabled={isInputDisabled} />
      {/* SECTION 3 - SCHEDULE */}
      <ProjectScheduleSection {...formProps} />
      {/* SECTION 4 - FINANCIALS */}
      <ProjectFinancialSection
        {...formProps}
        classOptions={classOptions}
        isInputDisabled={isInputDisabled}
      />
      {/* SECTION 5 - RESPONSIBLE PERSONS */}
      <ProjectResponsiblePersonsSection {...formProps} isInputDisabled={isInputDisabled} />
      {/* SECTION 6 - LOCATION */}
      <ProjectLocationSection
        {...formProps}
        locationOptions={locationOptions}
        isInputDisabled={isInputDisabled}
      />
      {/* SECTION 7 - PROJECT PROGRAM */}
      <ProjectProgramSection {...formProps} />
      {/* BANNER */}
      <ProjectFormBanner onSubmit={submitCallback} isDirty={isDirty} />
    </form>
  );
};

export default memo(ProjectForm);
