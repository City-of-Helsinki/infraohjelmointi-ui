import useProjectForm from '@/forms/useProjectForm';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IAppForms, IProjectForm } from '@/interfaces/formInterfaces';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { selectProjectMode, setIsSaving, setProjectMode } from '@/reducers/projectSlice';
import { IProject, IProjectFinances, IProjectRequest } from '@/interfaces/projectInterfaces';
import { dirtyFieldsToRequestObject } from '@/utils/common';
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
import { moveBudgetBackwards, moveBudgetForwards } from './financesUtils';
import { usePatchProjectMutation, usePostProjectMutation } from '@/api/projectApi';
import { getProjectPatchErrorMessage } from '@/utils/projectErrorMessage';
import { FieldErrors, FieldPath, SubmitErrorHandler } from 'react-hook-form';

interface IProjectFormProps {
  project: IProject | null;
}

const ProjectForm = ({ project }: IProjectFormProps) => {
  const { formMethods, classOptions, locationOptions, selectedMasterClassName, useWatchField } =
    useProjectForm(project);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [postProject] = usePostProjectMutation();
  const [patchProject] = usePatchProjectMutation();

  const user = useAppSelector(selectUser);
  const projectMode = useAppSelector(selectProjectMode);

  const isOnlyViewer = isUserOnlyViewer(user);

  const [newProjectId, setNewProjectId] = useState('');
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
    control,
    getValues,
    getFieldState,
    watch,
    setValue,
    setError,
    reset,
    trigger,
  } = formMethods;

  const collectErrorElements = useCallback((errors: FieldErrors<IProjectForm>) => {
    const visitedObjects = new WeakSet<object>();
    const elements: HTMLElement[] = [];

    const addElement = (value: unknown) => {
      if (value instanceof HTMLElement && value.isConnected) {
        elements.push(value);
      }
    };

    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (visitedObjects.has(value)) {
        return;
      }

      visitedObjects.add(value);

      if ('type' in value || 'message' in value || 'ref' in value) {
        if ('ref' in value) {
          addElement((value as { ref?: unknown }).ref);
        }
        return;
      }

      for (const nestedValue of Object.values(value)) {
        visit(nestedValue);
      }
    };

    visit(errors);

    return elements;
  }, []);

  const collectErrorFieldNames = useCallback((errors: FieldErrors<IProjectForm>) => {
    const visitedObjects = new WeakSet<object>();
    const fieldNames = new Set<string>();

    const visit = (value: unknown, path: string[] = []) => {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (visitedObjects.has(value)) {
        return;
      }

      visitedObjects.add(value);

      if ('type' in value || 'message' in value || 'ref' in value) {
        if (path.length > 0) {
          fieldNames.add(path[0]);
        }
        return;
      }

      for (const [key, nestedValue] of Object.entries(value)) {
        const nextPath = /^\d+$/.test(key) ? path : [...path, key];
        visit(nestedValue, nextPath);
      }
    };

    visit(errors);

    return [...fieldNames];
  }, []);

  const scrollToFirstField = useCallback((preferredElements: HTMLElement[] = [], fieldNames: string[] = []) => {
    if (!formRef.current) {
      return;
    }

    const form = formRef.current;

    const invalidFieldSelectors = [
      'input[aria-invalid="true"]',
      'textarea[aria-invalid="true"]',
      'select[aria-invalid="true"]',
      '[role="combobox"][aria-invalid="true"]',
      '[aria-invalid="true"] input:not([type="hidden"])',
      '[aria-invalid="true"] textarea',
      '[aria-invalid="true"] [role="combobox"]',
    ].join(', ');

    const queriedInvalidElements = Array.from(
      form.querySelectorAll<HTMLElement>(invalidFieldSelectors),
    );

    const fieldNameElements = fieldNames.flatMap((fieldName) => {
      const selectors = [
        `[id="${fieldName}"]`,
        `[id="projectForm.${fieldName}"]`,
        `[name="${fieldName}"]`,
        `[data-testid="${fieldName}"]`,
      ];

      return selectors
        .map((selector) => form.querySelector<HTMLElement>(selector))
        .filter((element): element is HTMLElement => element instanceof HTMLElement);
    });

    const uniqueCandidates = Array.from(
      new Set([...preferredElements, ...fieldNameElements, ...queriedInvalidElements]),
    ).filter((element) => element instanceof HTMLElement && form.contains(element));

    const visibleCandidates = uniqueCandidates.filter((element) => element.getClientRects().length > 0);
    const candidatesToSort = visibleCandidates.length > 0 ? visibleCandidates : uniqueCandidates;

    const scrollTarget = [...candidatesToSort].sort((first, second) => {
      const firstTop = first.getBoundingClientRect().top + window.scrollY;
      const secondTop = second.getBoundingClientRect().top + window.scrollY;

      if (firstTop !== secondTop) {
        return firstTop - secondTop;
      }

      const firstLeft = first.getBoundingClientRect().left + window.scrollX;
      const secondLeft = second.getBoundingClientRect().left + window.scrollX;
      return firstLeft - secondLeft;
    })[0];

    if (!scrollTarget) {
      return;
    }

    const focusTarget =
      (scrollTarget.matches(
        'input:not([type="hidden"]), textarea, select, [role="combobox"], button, [tabindex]:not([tabindex="-1"])',
      )
        ? scrollTarget
        : scrollTarget.querySelector<HTMLElement>(
        'input:not([type="hidden"]), textarea, [role="combobox"], button, [tabindex]:not([tabindex="-1"])',
          )) ?? scrollTarget;

    const absoluteTop = scrollTarget.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(absoluteTop - 120, 0);

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    if (typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
  }, []);

  const setBackendFieldErrors = useCallback(
    (error: unknown) => {
      if (!error || typeof error !== 'object') {
        return false;
      }

      const data = (error as { data?: unknown }).data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false;
      }

      const backendToFormFieldMap: Partial<Record<string, FieldPath<IProjectForm>>> = {
        projectClass: 'subClass',
        projectLocation: 'district',
        projectDistrict: 'district',
      };

      let hasFieldErrors = false;
      const fieldNamesWithErrors = new Set<string>();
      for (const [backendField, fieldError] of Object.entries(data)) {
        const mappedField =
          backendToFormFieldMap[backendField] ?? (backendField as FieldPath<IProjectForm>);

        const isFieldInForm =
          backendField in getValues() || backendField in backendToFormFieldMap;

        if (!isFieldInForm) {
          continue;
        }

        const message = Array.isArray(fieldError)
          ? fieldError.find((item) => typeof item === 'string')
          : typeof fieldError === 'string'
            ? fieldError
            : '';

        if (!message) {
          continue;
        }

        setError(mappedField, {
          type: 'server',
          message,
        });
        fieldNamesWithErrors.add(mappedField);
        hasFieldErrors = true;
      }

      if (hasFieldErrors) {
        window.requestAnimationFrame(() => {
          scrollToFirstField([], [...fieldNamesWithErrors]);
        });
      }

      return hasFieldErrors;
    },
    [getValues, setError, scrollToFirstField],
  );

  usePromptConfirmOnNavigate({
    title: t('confirmLeaveTitle'),
    description: t('confirmLeaveDescription'),
    when: isDirty,
  });

  /**
   * Reallocates budget when a phase end year is moved earlier.
   *
   * The budget from years that are no longer inside the schedule is moved into the new end year.
   * If the previous end year overlaps with the next phase start year, that overlapping year is kept
   * untouched and only fully out-of-schedule years are moved.
   *
   * Returns the original values when there is no earlier end-year change or when
   * there is no year range left to move.
   */
  const moveFinancesWhenEndYearMovesEarlier = (
    finances: IProjectFinances,
    previousEndYear: number | null,
    endYear: number | null,
    startYear: number | null,
  ): IProjectFinances => {
    // No change needed unless the end year was moved earlier.
    if (previousEndYear === null || endYear === null || endYear >= previousEndYear) {
      return finances;
    }

    // If schedule phases overlap (e.g. planning end == construction start), keep the overlapping year in place
    // and only move budgets that fall fully outside the updated schedule.
    const overlapAtPreviousEndYear = startYear !== null && startYear === previousEndYear;
    const sourceEndYear = overlapAtPreviousEndYear ? previousEndYear - 1 : previousEndYear;

    if (sourceEndYear <= endYear) {
      return finances;
    }

    return moveBudgetBackwards(finances, sourceEndYear, endYear);
  };

  /**
   * Reallocates budget when a phase start year is moved later.
   *
   * The budget from years that are no longer inside the schedule is moved into the new start year.
   * If the previous start year overlaps with the preceding phase end year, that overlapping year is kept
   * untouched and only fully out-of-schedule years are moved.
   *
   * Returns the original values when there is no later start-year change or when
   * there is no year range left to move.
   */
  const moveFinancesWhenStartYearMovesLater = (
    finances: IProjectFinances,
    previousStartYear: number | null,
    startYear: number | null,
    endYear: number | null,
  ): IProjectFinances => {
    // No change needed unless the start year was moved later.
    if (previousStartYear === null || startYear === null || startYear <= previousStartYear) {
      return finances;
    }

    // If schedule phases overlap (e.g. planning end == construction start), keep the overlapping year in place
    // and only move budgets that fall fully outside the updated schedule.
    const overlapAtPreviousStartYear = endYear !== null && endYear === previousStartYear;
    const sourceStartYear = overlapAtPreviousStartYear ? previousStartYear + 1 : previousStartYear;

    if (sourceStartYear >= startYear) {
      return finances;
    }

    return moveBudgetForwards(finances, sourceStartYear, startYear);
  };

  const updateFinances = (data: IProjectRequest, project: IProject) => {
    if (project.finances) {
      let updatedFinances = project.finances;

      if (data.planningStartYear) {
        const planningStartYear = project.planningStartYear ?? null;
        updatedFinances = moveFinancesWhenStartYearMovesLater(
          updatedFinances,
          planningStartYear,
          data.planningStartYear,
          null,
        );
      }
      if (data.estPlanningEnd) {
        const previousPlanningEndYear = getYear(project.estPlanningEnd);
        const planningEndYear = getYear(data.estPlanningEnd);
        const constructionStartYear = getYear(project.estConstructionStart);
        updatedFinances = moveFinancesWhenEndYearMovesEarlier(
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
        updatedFinances = moveFinancesWhenStartYearMovesLater(
          updatedFinances,
          previousConstructionStartYear,
          constructionStartYear,
          planningEndYear,
        );
      }
      if (data.constructionEndYear) {
        const constructionEndYear = project.constructionEndYear;
        updatedFinances = moveFinancesWhenEndYearMovesEarlier(
          updatedFinances,
          constructionEndYear,
          data.constructionEndYear,
          null,
        );
      }

      data = { ...data, finances: updatedFinances };
    }

    return data;
  };

  const updateDateBasedOnYear = (data: IProjectRequest, project: IProject) => {
    if (data.planningStartYear) {
      const estPlanningStart = data.estPlanningStart ?? project.estPlanningStart;
      if (estPlanningStart) {
        const isSamePlanningStartYear = isSameYear(estPlanningStart, data.planningStartYear);
        if (!isSamePlanningStartYear) {
          data.estPlanningStart = updateYear(data.planningStartYear, estPlanningStart);
        }
      }
    }
    if (data.constructionEndYear) {
      const estConstructionEnd = data.estConstructionEnd ?? project.estConstructionEnd;
      if (estConstructionEnd) {
        const isSameConstructionEndYear = isSameYear(estConstructionEnd, data.constructionEndYear);
        if (!isSameConstructionEndYear) {
          data.estConstructionEnd = updateYear(data.constructionEndYear, estConstructionEnd);
        }
      }
    }
    return data;
  };

  // useEffect which triggers when form fields are reset by setting selectedProject after successful POST request
  useEffect(() => {
    if (projectMode !== 'new') {
      return;
    }

    if (!isDirty && newProjectId) {
      dispatch(setProjectMode('edit'));
      navigate(`/project/${newProjectId}/basics`);
      setNewProjectId('');
    }
  }, [isDirty, newProjectId, navigate, projectMode, dispatch]);

  const hierarchyDistricts = useAppSelector(selectPlanningDistricts);
  const hierarchyDivisions = useAppSelector(selectPlanningDivisions);
  const hierarchySubDivisions = useAppSelector(selectPlanningSubDivisions);
  const groups = useAppSelector(selectPlanningGroups);

  const CREATE_NEW_PROJECT = 'create-new-project';

  const onSubmit = useCallback(
    async (form: IProjectForm) => {
      setHasSubmitAttempted(true);
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
          if (
            data.planningStartYear ||
            data.estPlanningEnd ||
            data.estConstructionStart ||
            data.constructionEndYear
          ) {
            data = updateFinances(data, project);
            data = updateDateBasedOnYear(data, project);
          }

          if (data?.projectClass && project.projectGroup) {
            const projectGroup = groups.find(({ id }) => id === project.projectGroup);
            if (data.projectClass !== projectGroup?.classRelation) {
              data = { ...data, projectGroup: null };
            }
          }

          try {
            await patchProject({ id: project?.id, data }).unwrap();
            reset(form);
            setHasSubmitAttempted(false);
            dispatch(setIsSaving(false));
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

            const hasBackendFieldErrors = setBackendFieldErrors(error);
            dispatch(
              notifyError({
                message: hasBackendFieldErrors
                  ? 'formSaveError'
                  : getProjectPatchErrorMessage(error),
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
            const response = await postProject({ data }).unwrap();
            dispatch(setIsSaving(false));
            reset(form);
            setHasSubmitAttempted(false);
            setNewProjectId(response.id);
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

            const hasBackendFieldErrors = setBackendFieldErrors(error);
            dispatch(setIsSaving(false));
            dispatch(
              notifyError({
                message: hasBackendFieldErrors ? 'formSaveError' : 'projectCreatingError',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      watch,
      setValue,
      useWatchField,
      trigger,
      hasSubmitAttempted,
    }),
    [
      control,
      getFieldProps,
      getFieldState,
      getValues,
      watch,
      setValue,
      useWatchField,
      trigger,
      hasSubmitAttempted,
    ],
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

  const onFormInvalid = useCallback<SubmitErrorHandler<IProjectForm>>((errors) => {
    setHasSubmitAttempted(true);
    scrollToFirstField(collectErrorElements(errors), collectErrorFieldNames(errors));
  }, [collectErrorElements, collectErrorFieldNames, scrollToFirstField]);

  const submitCallback = useCallback(() => {
    // We disable onBlur events when the datepicker is opened because it messes up with the HDS DateInput's DatePicker
    if (datePickerVisible) {
      return undefined;
    }

    return handleSubmit(onSubmit, onFormInvalid);
  }, [handleSubmit, onSubmit, onFormInvalid, datePickerVisible]);

  const isInputDisabled = useMemo(
    () => canUserEditProjectFormField(selectedMasterClassName, user),
    [selectedMasterClassName, user],
  );

  const isUserProjectManagerCheck = useMemo(() => isUserOnlyProjectManager(user), [user]);

  return (
    <form data-testid="project-form" className="project-form" ref={formRef}>
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
        project={project}
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
        project={project}
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
      <ProjectProgramSection {...formProps} isUserOnlyViewer={isOnlyViewer} />
      {/* BANNER */}
      {!isOnlyViewer && (
        <ProjectFormBanner
          project={project}
          onSubmit={submitCallback}
          isDirty={isDirty}
          isInputDisabled={isInputDisabled}
        />
      )}
    </form>
  );
};

export default memo(ProjectForm);
