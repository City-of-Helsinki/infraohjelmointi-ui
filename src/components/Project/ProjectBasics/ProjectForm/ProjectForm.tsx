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
import { IProject, IProjectFinances, IProjectRequest } from '@/interfaces/projectInterfaces';
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
import { useNavigate } from 'react-router';
import _ from 'lodash';
import './styles.css';
import { canUserEditProjectFormField } from '@/utils/validation';
import { selectUser } from '@/reducers/authSlice';
import { getProjectSapCosts } from '@/reducers/sapCostSlice';
import { getYear, isSameYear, updateYear } from '@/utils/dates';
import {
  selectPlanningDistricts,
  selectPlanningDivisions,
  selectPlanningSubDivisions,
} from '@/reducers/locationSlice';
import usePromptConfirmOnNavigate from '@/hooks/usePromptConfirmOnNavigate';
import { t } from 'i18next';
import { notifyError } from '@/reducers/notificationSlice';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { isUserOnlyProjectManager, isUserOnlyViewer } from '@/utils/userRoleHelpers';
import { AxiosError } from 'axios';
import { selectPlanningGroups } from '@/reducers/groupSlice';

const ProjectForm = () => {
  const { formMethods, classOptions, locationOptions, selectedMasterClassName } = useProjectForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);
  const project = useAppSelector(selectProject);
  const projectMode = useAppSelector(selectProjectMode);
  const sapCosts = useAppSelector(getProjectSapCosts);

  const currentYearSapValues = useMemo(() => {
    if (project?.currentYearsSapValues) {
      const filteredSapValues = project.currentYearsSapValues
        .filter((value) => value.project_id != null)
        .map((value) => ({
          id: value.project_id,
          year: value.year,
          sap_id: value.id,
          project_task_costs: value.project_task_costs,
          project_task_commitments: value.project_task_commitments,
          production_task_costs: value.production_task_costs,
          production_task_commitments: value.production_task_commitments,
        }));
      return filteredSapValues.length > 0 ? filteredSapValues[0] : null;
    }
    return null;
  }, [project?.currentYearsSapValues]);

  const isOnlyViewer = isUserOnlyViewer(user);

  const [newProjectId, setNewProjectId] = useState('');

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
    control,
    getValues,
    getFieldState,
  } = formMethods;

  usePromptConfirmOnNavigate({
    title: t('confirmLeaveTitle'),
    description: t('confirmLeaveDescription'),
    when: isDirty,
  });

  const getFinanceYearName = (finances: IProjectFinances, year: number) => {
    const index = year - finances.year;
    if (index < 3) {
      return ('budgetProposalCurrentYearPlus' + index) as keyof IProjectFinances;
    } else {
      return ('preliminaryCurrentYearPlus' + index) as keyof IProjectFinances;
    }
  };

  // Function to move budget/budgets to the first year that's within the project schedule
  const moveBudgetForwards = (
    finances: IProjectFinances,
    previousStartYear: number,
    startYear: number,
  ): IProjectFinances => {
    let financesCopy = finances;
    const numberOfYears = startYear - previousStartYear;
    let budgetToMove = 0.0;
    for (let i = 0; i < numberOfYears; ++i) {
      const financeYearName = getFinanceYearName(finances, Number(previousStartYear) + i);
      const financeValue = finances[financeYearName];
      budgetToMove += parseFloat(financeValue as string);
      financesCopy = { ...financesCopy, [financeYearName]: '0.00' };
    }
    const startYearName = getFinanceYearName(finances, startYear);
    const newBudget = (parseFloat(finances[startYearName] as string) || 0.0) + budgetToMove || 0.0;

    financesCopy = { ...financesCopy, [startYearName]: newBudget.toFixed(2) };
    return financesCopy;
  };

  // Function to move budget/budgets to the last year that's within the project schedule
  const moveBudgetBackwards = (
    finances: IProjectFinances,
    previousEndYear: number,
    endYear: number,
  ) => {
    let financesCopy = finances;
    const numberOfYears = previousEndYear - endYear;
    const maxIndex = 10 - (endYear - finances.year);
    let budgetToMove = 0.0;
    for (let i = 1; i <= numberOfYears && i <= maxIndex; ++i) {
      const financeYearName = getFinanceYearName(finances, Number(endYear) + i);
      const financeValue = finances[financeYearName];
      budgetToMove += parseFloat(financeValue as string);
      financesCopy = { ...financesCopy, [financeYearName]: '0.00' };
    }
    const endYearName = getFinanceYearName(finances, endYear);
    const newBudget = (parseFloat(finances[endYearName] as string) || 0.0) + budgetToMove || 0.0;

    financesCopy = { ...financesCopy, [endYearName]: newBudget.toFixed(2) };
    return financesCopy;
  };

  const updatePlanningStartYear = (
    finances: IProjectFinances,
    previousStartYear: number | null,
    startYear: number,
  ): IProjectFinances => {
    let updatedFinances = finances;
    // If new planning start year is bigger than the previous one, budget from years that are not within the schedule of the project
    // need to be moved to the new planning start year
    if (previousStartYear && startYear > previousStartYear) {
      updatedFinances = moveBudgetForwards(finances, previousStartYear, startYear);
    }
    return updatedFinances;
  };

  const updateEstPlanningEndYear = (
    finances: IProjectFinances,
    previousEndYear: number | null,
    endYear: number | null,
    startYear: number | null,
  ): IProjectFinances => {
    let updatedFinances = finances;
    // If new planning end year is smaller that the previous one, budget from the years that are not within the schedule need to
    // be moved backwards to the new end year
    if (previousEndYear && endYear && endYear < previousEndYear) {
      // If there was an overlap between planning end year and construction start year, budget shouldn't be moved from that year
      // but still needs to be moved from all the years that are not within the schedule anymore
      const yearIsOverlap = startYear == previousEndYear;
      const isMoreThanOneYearDifference = previousEndYear - endYear > 1;

      if (yearIsOverlap && isMoreThanOneYearDifference) {
        updatedFinances = moveBudgetBackwards(finances, previousEndYear - 1, endYear);
      } else if (!yearIsOverlap) {
        updatedFinances = moveBudgetBackwards(finances, previousEndYear, endYear);
      }
    }
    return updatedFinances;
  };

  const updateEstConstructionStartYear = (
    finances: IProjectFinances,
    previousStartYear: number | null,
    startYear: number | null,
    endYear: number | null,
  ): IProjectFinances => {
    let updatedFinances = finances;
    // If new construction start year is bigger than the previous one, budget from years that are not within the schedule of the project
    // need to be moved to the new construction start year
    if (previousStartYear && startYear && startYear > previousStartYear) {
      // If there was an overlap between planning end year and construction start year, budget shouldn't be moved from that year
      // but still needs to be moved from all the years that are not within the schedule anymore
      const yearIsOverlap = endYear == previousStartYear;
      const isMoreThanOneYearDifference = startYear - previousStartYear > 1;

      if (yearIsOverlap && isMoreThanOneYearDifference) {
        updatedFinances = moveBudgetForwards(finances, previousStartYear + 1, startYear);
      } else if (!yearIsOverlap) {
        updatedFinances = moveBudgetForwards(finances, previousStartYear, startYear);
      }
    }
    return updatedFinances;
  };

  const updateConstructionEndYear = (
    finances: IProjectFinances,
    previousEndYear: number | null,
    endYear: number,
  ): IProjectFinances => {
    let updatedFinances = finances;
    // If new construction end year is smaller that the previous one, budget from the years that are not within the schedule need to
    // be moved backwards to the new end year
    if (previousEndYear && endYear < previousEndYear) {
      updatedFinances = moveBudgetBackwards(finances, previousEndYear, endYear);
    }
    return updatedFinances;
  };

  const updateFinances = (data: IProjectRequest, project: IProject) => {
    if (project.finances) {
      let updatedFinances = project.finances;

      if (data.planningStartYear) {
        const planningStartYear = project.planningStartYear ?? null;
        updatedFinances = updatePlanningStartYear(
          updatedFinances,
          planningStartYear,
          data.planningStartYear,
        );
      }
      if (data.estPlanningEnd) {
        const previousPlanningEndYear = getYear(project.estPlanningEnd);
        const planningEndYear = getYear(data.estPlanningEnd);
        const constructionStartYear = getYear(project.estConstructionStart);
        updatedFinances = updateEstPlanningEndYear(
          updatedFinances,
          previousPlanningEndYear,
          planningEndYear,
          constructionStartYear,
        );
      }
      if (data.estConstructionStart) {
        const previousConstructionStartYear = getYear(project.estConstructionStart);
        const constructionStartYear = getYear(data.estConstructionStart);
        const planningEndYear = getYear(project.estPlanningEnd);
        updatedFinances = updateEstConstructionStartYear(
          updatedFinances,
          previousConstructionStartYear,
          constructionStartYear,
          planningEndYear,
        );
      }
      if (data.constructionEndYear) {
        const constructionEndYear = project.constructionEndYear;
        updatedFinances = updateConstructionEndYear(
          updatedFinances,
          constructionEndYear,
          data.constructionEndYear,
        );
      }

      data = { ...data, finances: updatedFinances };
    }

    return data;
  };

  const updateDateBasedOnYear = (data: IProjectRequest, project: IProject) => {
    if (data.planningStartYear) {
      const estPlanningStart = data.estPlanningStart ?? project.estPlanningStart;
      const isSamePlanningStartYear = isSameYear(estPlanningStart, data.planningStartYear);
      if (!isSamePlanningStartYear) {
        data.estPlanningStart = updateYear(data.planningStartYear, estPlanningStart)
      }
    }
    if (data.constructionEndYear) {
      const estConstructionEnd = data.estConstructionEnd ?? project.estConstructionEnd;
      const isSameConstructionEndYear = isSameYear(estConstructionEnd, data.constructionEndYear);
      if (!isSameConstructionEndYear) {
        data.estConstructionEnd = updateYear(data.constructionEndYear, estConstructionEnd)
      }
    }
    return data;
  }

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

  const hierarchyDistricts = useAppSelector(selectPlanningDistricts);
  const hierarchyDivisions = useAppSelector(selectPlanningDivisions);
  const hierarchySubDivisions = useAppSelector(selectPlanningSubDivisions);
  const groups = useAppSelector(selectPlanningGroups);

  const CREATE_NEW_PROJECT = 'create-new-project';

  const onSubmit = useCallback(
    async (form: IProjectForm) => {
      dispatch(setLoading({ text: 'Creating a new project', id: CREATE_NEW_PROJECT }));

      if (isDirty) {
        dispatch(setIsSaving(true));
        let data: IProjectRequest = dirtyFieldsToRequestObject(
          dirtyFields,
          form as IAppForms,
          hierarchyDistricts,
          hierarchyDivisions,
          hierarchySubDivisions,
        );

        // Patch project
        if (project?.id && projectMode === 'edit') {
          if (data.planningStartYear || data.constructionEndYear) {
            data = updateFinances(data, project);
            data = updateDateBasedOnYear(data, project);
          }

          if (data?.projectClass && project.projectGroup) {

            const projectGroup = groups.find(({ id }) => id === project.projectGroup);
            if (data.projectClass !== projectGroup?.classRelation) {
              data = { ...data, "projectGroup": null }
            }
          }

          /* If project is under a district and user changes the class, the district has to be removed or the
             project will remain under that district in the new class, which isn't intended behavior */
          if (data?.projectClass && project.projectLocation) {
            data = { ...data, projectLocation: null };
          }
          // The projectDistrict should also be deleted in order to not show it on the project form when class is changed
          if (data?.projectClass && project.projectDistrict) {
            data = { ...data, projectDistrict: null };
          }

          try {
            const response = await patchProject({ id: project?.id, data });
            if (response.status === 200) {
              dispatch(setSelectedProject(response.data));
              dispatch(setIsSaving(false));
            }
          } catch (error: unknown) {
            console.log('project patch error: ', error);
            if ((error as AxiosError).status === 403) {
              dispatch(
                notifyError({
                  message: 'accessError',
                  title: 'saveError',
                  type: 'notification',
                }),
              );
              dispatch(clearLoading(CREATE_NEW_PROJECT));
              dispatch(setIsSaving(false));
              return;
            }
            dispatch(
              notifyError({
                message: 'formSaveError',
                title: 'saveError',
                type: 'notification',
              }),
            );
            dispatch(setIsSaving(false));
            dispatch(clearLoading(CREATE_NEW_PROJECT));
            return;
          }
        }

        // Post project
        if (projectMode === 'new') {
          try {
            const response = await postProject({ data });
            if (response.status === 201) {
              dispatch(setIsSaving(false));
              dispatch(setSelectedProject(response.data));
              setNewProjectId(response.data.id);
            }
          } catch (error) {
            console.log('project post error: ', error);
            if ((error as AxiosError).status === 403) {
              dispatch(
                notifyError({
                  message: 'accessError',
                  title: 'saveError',
                  type: 'notification',
                }),
              );
              dispatch(clearLoading(CREATE_NEW_PROJECT));
              dispatch(setIsSaving(false));
              return;
            }
            dispatch(setIsSaving(false));
            dispatch(
              notifyError({
                message: 'projectCreatingError',
                title: 'createError',
                type: 'notification',
              }),
            );
          }
        }
      }
      dispatch(setIsSaving(false));
      dispatch(clearLoading(CREATE_NEW_PROJECT));
    },
    [
      dispatch,
      isDirty,
      dirtyFields,
      hierarchyDistricts,
      hierarchyDivisions,
      hierarchySubDivisions,
      project,
      projectMode,
      user,
      updateFinances,
    ],
  );

  const getFieldProps = useCallback(
    (name: string) => {
      return {
        name: name,
        label: `projectForm.${name}`,
        control: control,
        sapCosts: project ? sapCosts[project?.id] : null,
        sapCurrentYear: project ? currentYearSapValues : null,
      };
    },
    [control],
  );

  const formProps = useMemo(
    () => ({
      getFieldProps,
      control,
      getValues,
      getFieldState,
    }),
    [control, getFieldProps, getFieldState, getValues],
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

  const isUserProjectManagerCheck = useMemo(() => isUserOnlyProjectManager(user), [user]);

  return (
    <form data-testid="project-form" className="project-form">
      {/* SECTION 1 - BASIC INFO */}
      <ProjectInfoSection
        {...formProps}
        project={project}
        isInputDisabled={isInputDisabled}
        projectMode={projectMode}
        isUserOnlyViewer={isOnlyViewer}
      />
      {/* SECTION 2 - STATUS */}
      <ProjectStatusSection
        {...formProps}
        constructionEndYear={project?.constructionEndYear}
        isInputDisabled={isInputDisabled}
        isUserOnlyProjectManager={isUserProjectManagerCheck}
        isUserOnlyViewer={isOnlyViewer}
      />
      {/* SECTION 3 - SCHEDULE */}
      <ProjectScheduleSection
        {...formProps}
        isUserOnlyProjectManager={isUserProjectManagerCheck}
        isUserOnlyViewer={isOnlyViewer}
      />
      {/* SECTION 4 - FINANCIALS */}
      <ProjectFinancialSection
        {...formProps}
        classOptions={classOptions}
        isInputDisabled={isInputDisabled}
        isUserOnlyViewer={isOnlyViewer}
      />
      {/* SECTION 5 - RESPONSIBLE PERSONS */}
      <ProjectResponsiblePersonsSection
        {...formProps}
        isInputDisabled={isInputDisabled}
        isUserOnlyViewer={isOnlyViewer}
      />
      {/* SECTION 6 - LOCATION */}
      <ProjectLocationSection
        {...formProps}
        locationOptions={locationOptions}
        isInputDisabled={isInputDisabled}
        isUserOnlyViewer={isOnlyViewer}
      />
      {/* SECTION 7 - PROJECT PROGRAM */}
      <ProjectProgramSection 
        {...formProps}
        isUserOnlyViewer={isOnlyViewer}
      />
      {/* BANNER */}
      {!isOnlyViewer &&
        <ProjectFormBanner
          onSubmit={submitCallback}
          isDirty={isDirty}
          isInputDisabled={isInputDisabled} />}
    </form>
  );
};

export default memo(ProjectForm);
