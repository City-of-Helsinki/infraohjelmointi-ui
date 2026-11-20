import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  IMyWorkloadEditFormValues,
  MyWorkloadEditDialogProps,
} from '@/interfaces/myWorkloadInterfaces';
import { IListItem } from '@/interfaces/common';
import { selectProjectPhases } from '@/reducers/listsSlice';
import {
  getProjectPhaseDetailOptions,
  phaseDetailBelongsToPhase,
  phaseHasDetails,
} from '@/utils/projectPhaseDetails';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useGetProjectByIdQuery, usePatchProjectMutation } from '@/api/projectApi';
import TextField from '@/components/shared/TextField';
import { Button, ButtonVariant, Dialog, Notification, Option, Select } from 'hds-react';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitErrorHandler, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import classes from '../styles.module.css';
import { mergeMyWorkloadProjectResponse } from '@/utils/myWorkloadMappingUtils';
import {
  getMyWorkloadProjectRequestFields,
  myWorkloadValuesToProjectRequest,
} from '@/utils/myWorkloadProjectRequest';
import { collectErrorFieldNames, scrollToFirstField } from '@/utils/formErrorHelpers';
import useMyWorkloadEditForm from '@/forms/useMyWorkloadEditForm';
import { mapProjectToFormValues } from '@/utils/myWorkloadFormUtils';
import MyWorkloadDateField from './MyWorkloadDateField';
import {
  constructionVisibleValidationFields,
  mapDialogValuesToValidationState,
  mapProjectToValidationState,
  planningVisibleValidationFields,
  validationFieldToFormFieldMap,
} from '@/utils/myWorkloadValidationUtils';
import {
  createProjectPhaseResolver,
  getNewProjectValidationIssues,
  ProjectValidationIssue,
  translateProjectValidationField,
  translateProjectValidationIssue,
} from '@/utils/projectValidationRules';
import { skipToken } from '@reduxjs/toolkit/query';
import useMyWorkloadPlanningLink from '@/hooks/useMyWorkloadPlanningLink';

const MyWorkloadEditDialog: FC<MyWorkloadEditDialogProps> = ({
  isOpen,
  project,
  viewType,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const phases = useAppSelector(selectProjectPhases);
  const phaseDetails = useAppSelector((state) => state.lists.projectPhaseDetails);
  const planningPhases = useAppSelector((state) => state.lists.planningPhases);
  const constructionPhases = useAppSelector((state) => state.lists.constructionPhases);
  const [patchProject, { isLoading }] = usePatchProjectMutation();
  const { data: fullProject, isFetching: isProjectLoading } = useGetProjectByIdQuery(
    isOpen && project?.id ? project.id : skipToken,
    { refetchOnMountOrArgChange: true },
  );
  const matchingProject = fullProject?.id === project?.id ? fullProject : undefined;
  const planningLink = useMyWorkloadPlanningLink(matchingProject);
  const showLinkToPlanningView = matchingProject?.programmed === true && Boolean(planningLink);

  const dialogContentRef = useRef<HTMLDivElement | null>(null);
  const planningStartFieldRef = useRef<HTMLDivElement | null>(null);
  const planningEndFieldRef = useRef<HTMLDivElement | null>(null);
  const presenceStartFieldRef = useRef<HTMLDivElement | null>(null);
  const presenceEndFieldRef = useRef<HTMLDivElement | null>(null);
  const visibilityStartFieldRef = useRef<HTMLDivElement | null>(null);
  const visibilityEndFieldRef = useRef<HTMLDivElement | null>(null);
  const constructionStartFieldRef = useRef<HTMLDivElement | null>(null);
  const constructionEndFieldRef = useRef<HTMLDivElement | null>(null);
  const phaseFieldRef = useRef<HTMLDivElement | null>(null);
  const phaseDetailFieldRef = useRef<HTMLDivElement | null>(null);
  const { control, getValues, handleSubmit, setValue, setError, clearErrors } =
    useMyWorkloadEditForm(project);
  const [hiddenValidationIssues, setHiddenValidationIssues] = useState<ProjectValidationIssue[]>(
    [],
  );

  const isPlanningView = viewType === 'planning';
  const selectedPhaseId = useWatch({ control, name: 'phaseId' });
  const visibleValidationFields = useMemo(
    () => (isPlanningView ? planningVisibleValidationFields : constructionVisibleValidationFields),
    [isPlanningView],
  );
  const phaseResolver = useMemo(
    () =>
      createProjectPhaseResolver(
        phases.map((phase) => ({ value: phase.id, label: phase.value })),
        phaseDetails,
      ),
    [phases, phaseDetails],
  );

  const dateFieldRefs = useMemo(
    () => ({
      planningStart: planningStartFieldRef,
      planningEnd: planningEndFieldRef,
      presenceStart: presenceStartFieldRef,
      presenceEnd: presenceEndFieldRef,
      visibilityStart: visibilityStartFieldRef,
      visibilityEnd: visibilityEndFieldRef,
      constructionStart: constructionStartFieldRef,
      constructionEnd: constructionEndFieldRef,
    }),
    [],
  );

  // All fields whose containers we can scroll/focus when they fail validation on submit.
  const errorFieldRefs = useMemo(
    () => ({
      ...dateFieldRefs,
      phaseId: phaseFieldRef,
      phaseDetailId: phaseDetailFieldRef,
    }),
    [dateFieldRefs],
  );

  const phaseOptions = useMemo(
    () =>
      phases.map((phase) => ({
        value: phase.id,
        label: t(`option.${phase.value}`),
      })),
    [phases, t],
  );

  const planningPhaseOptions = useMemo(
    () =>
      planningPhases.map((phase: IListItem) => ({
        value: phase.id,
        label: t(`option.${phase.value}`),
      })),
    [planningPhases, t],
  );

  const constructionPhaseOptions = useMemo(
    () =>
      constructionPhases.map((phase: IListItem) => ({
        value: phase.id,
        label: t(`option.${phase.value}`),
      })),
    [constructionPhases, t],
  );

  const phaseDetailOptions = useMemo(
    () =>
      getProjectPhaseDetailOptions(phaseDetails, selectedPhaseId).map((detail) => ({
        ...detail,
        label: t(`option.${detail.label}`),
      })),
    [phaseDetails, selectedPhaseId, t],
  );

  useEffect(() => {
    const selectedPhaseDetailId = getValues('phaseDetailId');
    clearErrors('phaseDetailId');
    if (!phaseDetailBelongsToPhase(phaseDetails, selectedPhaseDetailId, selectedPhaseId)) {
      setValue('phaseDetailId', '');
    }
  }, [clearErrors, getValues, phaseDetails, selectedPhaseId, setValue]);

  const onGoToProjectCardClick = useCallback(() => {
    if (!project) {
      return;
    }
    setHiddenValidationIssues([]);
    clearErrors();
    onClose();
    navigate(`/project/${project.id}/basics`);
  }, [clearErrors, navigate, onClose, project]);

  const onDialogClose = useCallback(() => {
    setHiddenValidationIssues([]);
    clearErrors();
    onClose();
  }, [clearErrors, onClose]);

  const onGoToPlanningClick = () => {
    if (!planningLink) return;
    onDialogClose();
    navigate(planningLink);
  };

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- render-phase setState breaks useSelector in React 18.2 (facebook/react#25565)
      setHiddenValidationIssues([]);
      clearErrors();
    }
  }, [clearErrors, isOpen]);

  const onSubmitValid = useCallback(
    async (values: IMyWorkloadEditFormValues) => {
      if (!project) {
        return;
      }

      setHiddenValidationIssues([]);
      clearErrors();

      const originalValues = mapProjectToFormValues(project);
      const payload = myWorkloadValuesToProjectRequest(
        values,
        originalValues,
        getMyWorkloadProjectRequestFields(isPlanningView),
      );

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }

      if (fullProject) {
        const nextProjectState = mapDialogValuesToValidationState(fullProject, values);
        const newIssues = getNewProjectValidationIssues({
          originalProject: mapProjectToValidationState(fullProject),
          nextProject: nextProjectState,
          phaseResolver,
          visibleFields: visibleValidationFields,
        });

        const visibleIssues = newIssues.filter((issue) => issue.visibleInDialog);
        const issuesHiddenInDialog = newIssues.filter((issue) => !issue.visibleInDialog);

        visibleIssues.forEach((issue) => {
          const fieldName = validationFieldToFormFieldMap[issue.field];
          if (!fieldName) {
            return;
          }

          setError(fieldName, {
            type: issue.rule,
            message: translateProjectValidationIssue(issue, t),
          });
        });

        if (issuesHiddenInDialog.length > 0) {
          setHiddenValidationIssues(issuesHiddenInDialog);
        }

        if (visibleIssues.length > 0 || issuesHiddenInDialog.length > 0) {
          return;
        }
      }

      try {
        const patchedProject = await patchProject({
          id: project.id,
          data: payload,
        }).unwrap();

        onSave(mergeMyWorkloadProjectResponse(project, patchedProject, t));

        dispatch(
          notifySuccess({
            message: 'patchSuccess',
            title: 'patchSuccess',
            type: 'toast',
            duration: 1500,
          }),
        );

        onClose();
      } catch {
        dispatch(
          notifyError({
            message: 'patchError',
            title: 'patchError',
            type: 'toast',
            duration: 1500,
          }),
        );
      }
    },
    [
      dispatch,
      fullProject,
      isPlanningView,
      onClose,
      onSave,
      patchProject,
      phaseResolver,
      project,
      setError,
      clearErrors,
      t,
      visibleValidationFields,
    ],
  );

  const onFormInvalid = useCallback<SubmitErrorHandler<IMyWorkloadEditFormValues>>(
    (errors) => {
      const fieldNames = collectErrorFieldNames(errors);
      const preferredElements = fieldNames
        .map((fieldName) => errorFieldRefs[fieldName as keyof typeof errorFieldRefs]?.current)
        .filter((element): element is HTMLDivElement => Boolean(element));

      // focus: false avoids a blur-triggered revalidation loop on the HDS date inputs
      scrollToFirstField(dialogContentRef.current, preferredElements, fieldNames, {
        focus: false,
      });
    },
    [errorFieldRefs],
  );

  const onSubmit = useCallback(() => {
    handleSubmit(onSubmitValid, onFormInvalid)();
  }, [handleSubmit, onSubmitValid, onFormInvalid]);

  const hiddenValidationFieldList = useMemo(
    () =>
      Array.from(
        new Set(
          hiddenValidationIssues.map((issue) => translateProjectValidationField(issue.field, t)),
        ),
      ).join(', '),
    [hiddenValidationIssues, t],
  );

  return (
    <Dialog
      isOpen={isOpen}
      close={onDialogClose}
      id="my-workload-edit-dialog"
      aria-labelledby="my-workload-edit-dialog-title"
      aria-describedby="my-workload-edit-dialog-content"
      closeButtonLabelText={t('closeDialog')}
    >
      <Dialog.Header id="my-workload-edit-dialog-title" title={project?.projectName ?? ''} />
      <Dialog.Content>
        <div
          className={classes.editDialogFields}
          id="my-workload-edit-dialog-content"
          ref={dialogContentRef}
        >
          {isPlanningView && (
            <>
              <h3 className={classes.editDialogSectionTitle}>
                {t('myWorkloadView.table.planningScheduleTitle')}
              </h3>

              <div className={classes.editDialogDateRow}>
                <MyWorkloadDateField
                  id="my-workload-edit-planning-start"
                  name="planningStart"
                  label={t('myWorkloadView.table.planningStart')}
                  required
                  control={control}
                  getValues={getValues}
                  containerRef={planningStartFieldRef}
                />
                <MyWorkloadDateField
                  id="my-workload-edit-planning-end"
                  name="planningEnd"
                  label={t('myWorkloadView.table.planningEnd')}
                  required
                  control={control}
                  getValues={getValues}
                  containerRef={planningEndFieldRef}
                />
              </div>

              <div className={classes.editDialogDateRow}>
                <MyWorkloadDateField
                  id="my-workload-edit-presence-start"
                  name="presenceStart"
                  label={t('projectForm.presenceStart')}
                  control={control}
                  getValues={getValues}
                  containerRef={presenceStartFieldRef}
                />
                <MyWorkloadDateField
                  id="my-workload-edit-presence-end"
                  name="presenceEnd"
                  label={t('projectForm.presenceEnd')}
                  control={control}
                  getValues={getValues}
                  containerRef={presenceEndFieldRef}
                />
              </div>

              <div className={classes.editDialogDateRow}>
                <MyWorkloadDateField
                  id="my-workload-edit-visibility-start"
                  name="visibilityStart"
                  label={t('projectForm.visibilityStart')}
                  control={control}
                  getValues={getValues}
                  containerRef={visibilityStartFieldRef}
                />
                <MyWorkloadDateField
                  id="my-workload-edit-visibility-end"
                  name="visibilityEnd"
                  label={t('projectForm.visibilityEnd')}
                  control={control}
                  getValues={getValues}
                  containerRef={visibilityEndFieldRef}
                />
              </div>

              <hr className={classes.editDialogDivider} />
            </>
          )}
          {!isPlanningView && (
            <>
              <div className={classes.editDialogDateRow}>
                <MyWorkloadDateField
                  id="my-workload-edit-construction-start"
                  name="constructionStart"
                  label={t('validation.estConstructionStart')}
                  required
                  control={control}
                  getValues={getValues}
                  containerRef={constructionStartFieldRef}
                />
                <MyWorkloadDateField
                  id="my-workload-edit-construction-end"
                  name="constructionEnd"
                  label={t('validation.estConstructionEnd')}
                  required
                  control={control}
                  getValues={getValues}
                  containerRef={constructionEndFieldRef}
                />
              </div>

              <hr className={classes.editDialogDivider} />
            </>
          )}
          <Controller
            name="phaseId"
            control={control}
            rules={{ required: t('myWorkloadView.table.requiredField') }}
            render={({ field, fieldState: { error } }) => (
              <div ref={phaseFieldRef}>
                <Select
                  id="my-workload-edit-phase"
                  className="custom-select"
                  options={phaseOptions}
                  value={field.value ?? ''}
                  onChange={(_, clickedOption: Option) => field.onChange(clickedOption.value)}
                  invalid={Boolean(error)}
                  texts={{
                    label: t('myWorkloadView.table.phase'),
                    placeholder: t('select'),
                    error: error?.message,
                  }}
                  required
                />
              </div>
            )}
          />
          <Controller
            name="phaseDetailId"
            control={control}
            rules={{
              validate: (value) =>
                phaseHasDetails(phaseDetails, selectedPhaseId) && !value
                  ? t('validation.required', { field: t('validation.phaseDetail') })
                  : true,
            }}
            render={({ field, fieldState: { error } }) => (
              <div ref={phaseDetailFieldRef}>
                <Select
                  id="my-workload-edit-phase-detail"
                  className="custom-select"
                  options={phaseDetailOptions}
                  value={field.value ?? ''}
                  onChange={(_, clickedOption: Option) => field.onChange(clickedOption.value)}
                  invalid={Boolean(error)}
                  texts={{
                    label: t('projectForm.phaseDetail'),
                    placeholder: t('select'),
                    error: error?.message,
                  }}
                  disabled={phaseDetailOptions.length === 0}
                  required={phaseDetailOptions.length > 0}
                />
              </div>
            )}
          />
          <hr className={classes.editDialogDivider} />
          {isPlanningView && (
            <>
              <h3 className={classes.editDialogSectionTitle}>
                {t('myWorkloadView.table.designCostEstimateSectionTitle')}
              </h3>

              <div className={classes.editDialogPlanningEstimateRow}>
                <TextField
                  id="my-workload-edit-planning-cost-forecast"
                  name="planningCostForecast"
                  label="myWorkloadView.table.costEstimate"
                  control={control}
                  helperText={t('keur')}
                />
                <Controller
                  name="planningPhaseId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="my-workload-edit-planning-phase"
                      className={`${classes.editDialogPlanningPhaseSelect} custom-select`}
                      options={planningPhaseOptions}
                      value={field.value ?? ''}
                      onChange={(_, clickedOption: Option) => field.onChange(clickedOption.value)}
                      texts={{
                        label: t('projectForm.planningPhase'),
                        placeholder: t('choose'),
                      }}
                    />
                  )}
                />
                <TextField
                  id="my-workload-edit-planning-work-quantity"
                  name="planningWorkQuantity"
                  label="myWorkloadView.table.workQuantity"
                  control={control}
                  helperText={t('m2')}
                />
              </div>
            </>
          )}
          {!isPlanningView && (
            <>
              <h3 className={classes.editDialogSectionTitle}>
                {t('myWorkloadView.table.constructionCostForecast')}
              </h3>

              <div className={classes.editDialogPlanningEstimateRow}>
                <TextField
                  id="my-workload-edit-construction-cost-forecast"
                  name="constructionCostForecast"
                  label="myWorkloadView.table.costEstimate"
                  control={control}
                  helperText={t('keur')}
                />
                <Controller
                  name="constructionPhaseId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="my-workload-edit-construction-phase"
                      className={`${classes.editDialogPlanningPhaseSelect} custom-select`}
                      options={constructionPhaseOptions}
                      value={field.value ?? ''}
                      onChange={(_, clickedOption: Option) => field.onChange(clickedOption.value)}
                      texts={{
                        label: t('projectForm.constructionPhase'),
                        placeholder: t('choose'),
                      }}
                    />
                  )}
                />
                <TextField
                  id="my-workload-edit-construction-work-quantity"
                  name="constructionWorkQuantity"
                  label="myWorkloadView.table.workQuantity"
                  control={control}
                  helperText={t('m2')}
                />
              </div>
            </>
          )}
          {hiddenValidationIssues.length > 0 && (
            <Notification
              type="error"
              label={t('myWorkloadView.table.projectBasicsValidationNotificationTitle')}
            >
              <div className={classes.editDialogNotificationContent}>
                <p>
                  {t('myWorkloadView.table.projectBasicsValidationNotificationText', {
                    fields: hiddenValidationFieldList,
                  })}
                </p>
                <div>
                  <Button variant={ButtonVariant.Secondary} onClick={onGoToProjectCardClick}>
                    {t('myWorkloadView.table.goToProjectBasicsToFixValidation')}
                  </Button>
                </div>
              </div>
            </Notification>
          )}
        </div>
      </Dialog.Content>
      <div className={classes.editDialogActionButtonRow}>
        <Button
          className={classes.editDialogActionButton}
          onClick={onSubmit}
          disabled={isLoading || isProjectLoading}
        >
          {t('save')}
        </Button>
        <Button
          className={classes.editDialogActionButton}
          onClick={onDialogClose}
          variant={ButtonVariant.Secondary}
          disabled={isLoading || isProjectLoading}
        >
          {t('cancel')}
        </Button>
      </div>
      <div className={classes.editDialogFooterActionContainer}>
        <Button
          variant={ButtonVariant.Secondary}
          className={classes.editDialogActionButton}
          onClick={onGoToProjectCardClick}
          disabled={!project}
        >
          {t('myWorkloadView.table.goToProjectCardEdit')}
        </Button>
        {showLinkToPlanningView && (
          <Button
            variant={ButtonVariant.Secondary}
            className={classes.editDialogActionButton}
            onClick={onGoToPlanningClick}
            disabled={isLoading || isProjectLoading}
          >
            {t('myWorkloadView.table.goToPlanning')}
          </Button>
        )}
      </div>
    </Dialog>
  );
};

export default MyWorkloadEditDialog;
