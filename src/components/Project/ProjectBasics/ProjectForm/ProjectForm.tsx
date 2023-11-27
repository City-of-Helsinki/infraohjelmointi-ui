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
import usePromptConfirmOnNavigate from '@/hooks/usePromptConfirmOnNavigate';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import _ from 'lodash';
import './styles.css';
import { canUserEditProjectFormField } from '@/utils/validation';
import { selectUser } from '@/reducers/authSlice';
import { getProjectSapCosts } from '@/reducers/sapCostSlice';
import { getYear } from '@/utils/dates';

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

  const getFinanceYearName = (finances: IProjectFinances, year: number) => {
    const index = year - finances.year;
    if (index < 3) {
      return "budgetProposalCurrentYearPlus" + index as keyof IProjectFinances;
    }
    else {
      return "preliminaryCurrentYearPlus" + index as keyof IProjectFinances;
    }
  }

  // Function to move budget/budgets to the first year that's within the project schedule
  const moveBudgetForwards = (finances: IProjectFinances, previousStartYear: number, startYear: number) => {
    let financesCopy = finances
    const numberOfYears = startYear - previousStartYear;
    let budgetToMove = 0.00;
    for (let i=0; i<numberOfYears; ++i) {
      const financeYearName = getFinanceYearName(finances, previousStartYear + i);
      const financeValue = finances[financeYearName];
      budgetToMove += parseFloat(financeValue as string);
      financesCopy = { ...financesCopy, [financeYearName]: "0.00"};
    }
    const startYearName = getFinanceYearName(finances, startYear);
    const newBudget = (parseFloat(finances[startYearName] as string) || 0.00) + budgetToMove;

    financesCopy = { ...financesCopy, [startYearName]: newBudget.toFixed(2)}
    return financesCopy;
  }

  // Function to move budget/budgets to the last year that's within the project schedule
  const moveBudgetBackwards = (finances: IProjectFinances, previousEndYear: number, endYear: number) => {
    let financesCopy = finances;
    const numberOfYears = previousEndYear - endYear;
    const maxIndex = 10 - (endYear - finances.year);
    let budgetToMove = 0.00;
    for (let i=1; i<=numberOfYears && i<=maxIndex; ++i) {
      const financeYearName = getFinanceYearName(finances, endYear + i);
      const financeValue = finances[financeYearName];
      budgetToMove += parseFloat(financeValue as string);
      financesCopy = { ...financesCopy, [financeYearName]: "0.00"};
    }
    const endYearName = getFinanceYearName(finances, endYear);
    const newBudget = (parseFloat(finances[endYearName] as string) || 0.00) + budgetToMove;

    financesCopy =  { ...financesCopy, [endYearName]: newBudget.toFixed(2)}
    return financesCopy;
  }

  const updatePlanningStartYear = (finances: IProjectFinances, previousStartYear: number | null, startYear: number) => {
    let updatedFinances;
    // If new planning start year is bigger than the previous one, budget from years that are not within the schedule of the project
    // need to be moved to the new planning start year
    if(previousStartYear && startYear > previousStartYear) {
      updatedFinances = moveBudgetForwards(finances, previousStartYear, startYear);
    }
    return updatedFinances;
  }

  const updateEstPlanningEndYear = (finances: IProjectFinances, previousEndYear: number | null, endYear: number | null, startYear: number | null) => {
    let updatedFinances;
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
      finances = updatedFinances || finances;
    }
    return updatedFinances;
  }

  const updateEstConstructionStartYear = (finances: IProjectFinances, previousStartYear: number | null, startYear: number | null, endYear: number | null) => {
    let updatedFinances;
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

        finances = updatedFinances || finances;
      }
      return updatedFinances;
  }

  const updateConstructionEndYear = (finances: IProjectFinances, previousEndYear: number | null, endYear: number) => {
    let updatedFinances;
    // If new construction end year is smaller that the previous one, budget from the years that are not within the schedule need to
    // be moved backwards to the new end year
    if (previousEndYear && endYear < previousEndYear) {
      updatedFinances = moveBudgetBackwards(finances, previousEndYear, endYear);
    }
    return updatedFinances;
  }

  const updateFinances = (data: IProjectRequest, project: IProject) => {
    let finances = project.finances;
    let updatedFinances;

    if (data.planningStartYear) {
      const planningStartYear = project.planningStartYear ?? null;
      updatedFinances = updatePlanningStartYear(finances, planningStartYear, data.planningStartYear);
      finances = updatedFinances ?? finances;
    }
    if (data.estPlanningEnd) {
      const previousPlanningEndYear = getYear(project.estPlanningEnd);
      const planningEndYear = getYear(data.estPlanningEnd);
      const constructionStartYear = getYear(project.estConstructionStart);
      updatedFinances = updateEstPlanningEndYear(finances, previousPlanningEndYear, planningEndYear, constructionStartYear);
      finances = updatedFinances ?? finances;
    }
    if (data.estConstructionStart) {
      const previousConstructionStartYear = getYear(project.estConstructionStart);
      const constructionStartYear = getYear(data.estConstructionStart);
      const planningEndYear = getYear(project.estPlanningEnd);
      updatedFinances = updateEstConstructionStartYear(finances, previousConstructionStartYear, constructionStartYear, planningEndYear);
      finances = updatedFinances ?? finances;
    }
    if (data.constructionEndYear) {
      const constructionEndYear = project.constructionEndYear;
      updatedFinances = updateConstructionEndYear(finances, constructionEndYear, data.constructionEndYear);
    }

    data = {...data, "finances": updatedFinances};
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

  const onSubmit = useCallback(
    async (form: IProjectForm) => {
      if (isDirty) {
        dispatch(setIsSaving(true));

        let data: IProjectRequest = dirtyFieldsToRequestObject(dirtyFields, form as IAppForms);

        // Patch project
        if (project?.id && projectMode === 'edit') {
          // If any of these is modified there's a chance that some finance years might be out of schedule, so budgets from those years need
          // to be moved to years that are within schedule
          if (data.planningStartYear || data.estPlanningEnd || data.estConstructionStart || data.constructionEndYear) {
            data = updateFinances(data, project);
          }

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
