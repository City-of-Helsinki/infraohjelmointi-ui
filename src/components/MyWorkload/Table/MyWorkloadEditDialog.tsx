import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { MyWorkloadTableRow, MyWorkloadViewType } from '@/interfaces/myWorkloadInterfaces';
import { IListItem } from '@/interfaces/common';
import { selectProjectPhases } from '@/reducers/listsSlice';
import {
  getProjectPhaseDetailOptions,
  phaseDetailBelongsToPhase,
  phaseHasDetails,
} from '@/utils/projectPhaseDetails';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { usePatchProjectMutation } from '@/api/projectApi';
import TextField from '@/components/shared/TextField';
import {
  Button,
  ButtonVariant,
  DateInput as HDSDateInput,
  Dialog,
  Option,
  Select,
} from 'hds-react';
import { FC, MouseEvent, RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import classes from '../styles.module.css';
import { normalizeMyWorkloadDate, toPhaseInfo } from '@/utils/myWorkloadUtils';
import {
  getMyWorkloadProjectRequestFields,
  myWorkloadValuesToProjectRequest,
} from '@/utils/myWorkloadProjectRequest';
import useMyWorkloadEditForm, {
  IMyWorkloadEditFormValues,
  mapProjectToFormValues,
} from './useMyWorkloadEditForm';

interface MyWorkloadEditDialogProps {
  isOpen: boolean;
  project: MyWorkloadTableRow | null;
  viewType: MyWorkloadViewType;
  onClose: () => void;
  onSave: (row: MyWorkloadTableRow) => void;
}

type DateFieldName =
  | 'planningStart'
  | 'planningEnd'
  | 'presenceStart'
  | 'presenceEnd'
  | 'visibilityStart'
  | 'visibilityEnd'
  | 'constructionStart'
  | 'constructionEnd';

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
  const planningStartFieldRef = useRef<HTMLDivElement | null>(null);
  const planningEndFieldRef = useRef<HTMLDivElement | null>(null);
  const presenceStartFieldRef = useRef<HTMLDivElement | null>(null);
  const presenceEndFieldRef = useRef<HTMLDivElement | null>(null);
  const visibilityStartFieldRef = useRef<HTMLDivElement | null>(null);
  const visibilityEndFieldRef = useRef<HTMLDivElement | null>(null);
  const constructionStartFieldRef = useRef<HTMLDivElement | null>(null);
  const constructionEndFieldRef = useRef<HTMLDivElement | null>(null);
  const { control, getValues, handleSubmit, setValue, clearErrors } =
    useMyWorkloadEditForm(project);

  const isPlanningView = viewType === 'planning';
  const selectedPhaseId = useWatch({ control, name: 'phaseId' });

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

  const openDatePicker = useCallback((containerRef: RefObject<HTMLDivElement>) => {
    const button = containerRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  }, []);

  const onDateInputClick = useCallback(
    (containerRef: RefObject<HTMLDivElement>) => (event: MouseEvent<HTMLInputElement>) => {
      event.stopPropagation();
      openDatePicker(containerRef);
    },
    [openDatePicker],
  );

  const onGoToProjectCardClick = useCallback(() => {
    if (!project) {
      return;
    }

    clearErrors();
    onClose();
    navigate(`/project/${project.id}/basics`);
  }, [clearErrors, navigate, onClose, project]);

  const onDialogClose = useCallback(() => {
    clearErrors();
    onClose();
  }, [clearErrors, onClose]);

  useEffect(() => {
    if (!isOpen) {
      clearErrors();
    }
  }, [clearErrors, isOpen]);

  const onSubmitValid = useCallback(
    async (values: IMyWorkloadEditFormValues) => {
      if (!project) {
        return;
      }

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

      try {
        const patchedProject = await patchProject({
          id: project.id,
          data: payload,
        }).unwrap();

        const resolveDateValue = (patchedValue: string | null | undefined, fallback: string) =>
          patchedValue === undefined ? fallback : normalizeMyWorkloadDate(patchedValue);

        const resolveTextValue = (patchedValue: string | null | undefined, fallback: string) =>
          patchedValue === undefined ? fallback : patchedValue ?? '';

        const resolveOptionIdValue = (
          patchedValue: IListItem | null | undefined,
          fallback: string,
        ) => (patchedValue === undefined ? fallback : patchedValue?.id ?? '');

        const resolvePhaseInfo = (
          patchedValue: IListItem | null | undefined,
          fallback: MyWorkloadTableRow['phase'],
        ) => (patchedValue === undefined ? fallback : toPhaseInfo(patchedValue ?? undefined, t));

        onSave({
          ...project,
          planningStart: resolveDateValue(patchedProject.estPlanningStart, project.planningStart),
          planningEnd: resolveDateValue(patchedProject.estPlanningEnd, project.planningEnd),
          presenceStart: resolveDateValue(patchedProject.presenceStart, project.presenceStart),
          presenceEnd: resolveDateValue(patchedProject.presenceEnd, project.presenceEnd),
          visibilityStart: resolveDateValue(
            patchedProject.visibilityStart,
            project.visibilityStart,
          ),
          visibilityEnd: resolveDateValue(patchedProject.visibilityEnd, project.visibilityEnd),
          constructionStart: resolveDateValue(
            patchedProject.estConstructionStart,
            project.constructionStart,
          ),
          constructionEnd: resolveDateValue(
            patchedProject.estConstructionEnd,
            project.constructionEnd,
          ),
          planningCostForecast: resolveTextValue(
            patchedProject.planningCostForecast,
            project.planningCostForecast,
          ),
          planningPhaseId: resolveOptionIdValue(
            patchedProject.planningPhase,
            project.planningPhaseId,
          ),
          planningWorkQuantity: resolveTextValue(
            patchedProject.planningWorkQuantity,
            project.planningWorkQuantity,
          ),
          constructionCostForecast: resolveTextValue(
            patchedProject.constructionCostForecast,
            project.constructionCostForecast,
          ),
          constructionPhaseId: resolveOptionIdValue(
            patchedProject.constructionPhase,
            project.constructionPhaseId,
          ),
          constructionWorkQuantity: resolveTextValue(
            patchedProject.constructionWorkQuantity,
            project.constructionWorkQuantity,
          ),
          phase: resolvePhaseInfo(patchedProject.phase, project.phase),
          phaseDetail: resolvePhaseInfo(patchedProject.phaseDetail, project.phaseDetail),
        });

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
    [dispatch, isPlanningView, onClose, onSave, patchProject, project, t],
  );

  const onSubmit = useCallback(() => {
    handleSubmit(onSubmitValid)();
  }, [handleSubmit, onSubmitValid]);

  const renderDateField = (field: {
    id: string;
    label: string;
    key: DateFieldName;
    required?: boolean;
  }) => {
    const requiredMessage = t('myWorkloadView.table.requiredField');
    const invalidDateMessage = t('myWorkloadView.table.invalidDate');

    return (
      <Controller
        key={field.id}
        name={field.key}
        control={control}
        rules={{
          validate: (value) => {
            const trimmedValue = value?.trim?.() ?? '';

            if (field.required && !trimmedValue) {
              return requiredMessage;
            }

            if (!trimmedValue) {
              return true;
            }

            return normalizeMyWorkloadDate(trimmedValue) ? true : invalidDateMessage;
          },
        }}
        render={({ field: controllerField, fieldState: { error } }) => (
          <div
            ref={dateFieldRefs[field.key]}
            className={`input-wrapper date-field-wrapper ${classes.editDialogDateField}`}
          >
            <HDSDateInput
              className="input-xl date-input"
              id={field.id}
              label={field.label}
              value={controllerField.value ?? ''}
              onChange={controllerField.onChange}
              onClick={onDateInputClick(dateFieldRefs[field.key])}
              placeholder=""
              language="fi"
              required={field.required}
              invalid={Boolean(error)}
              errorText={error?.message}
              initialMonth={new Date()}
            />
          </div>
        )}
      />
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      close={onDialogClose}
      id="my-workload-edit-dialog"
      aria-labelledby="my-workload-edit-dialog-title"
      aria-describedby="my-workload-edit-dialog-content"
      closeButtonLabelText={t('closeDialog')}
    >
      <Dialog.Header
        id="my-workload-edit-dialog-title"
        title={t('myWorkloadView.table.editDialogTitle')}
      />
      <Dialog.Content>
        <div className={classes.editDialogFields} id="my-workload-edit-dialog-content">
          <p className={classes.editDialogProjectSubtitle}>{project?.projectName ?? ''}</p>

          {isPlanningView && (
            <>
              <h3 className={classes.editDialogSectionTitle}>
                {t('myWorkloadView.table.planningScheduleTitle')}
              </h3>

              <div className={classes.editDialogDateRow}>
                {renderDateField({
                  id: 'my-workload-edit-planning-start',
                  key: 'planningStart',
                  label: t('myWorkloadView.table.planningStart'),
                  required: true,
                })}
                {renderDateField({
                  id: 'my-workload-edit-planning-end',
                  key: 'planningEnd',
                  label: t('myWorkloadView.table.planningEnd'),
                  required: true,
                })}
              </div>

              <div className={classes.editDialogDateRow}>
                {renderDateField({
                  id: 'my-workload-edit-presence-start',
                  key: 'presenceStart',
                  label: t('projectForm.presenceStart'),
                })}
                {renderDateField({
                  id: 'my-workload-edit-presence-end',
                  key: 'presenceEnd',
                  label: t('projectForm.presenceEnd'),
                })}
              </div>

              <div className={classes.editDialogDateRow}>
                {renderDateField({
                  id: 'my-workload-edit-visibility-start',
                  key: 'visibilityStart',
                  label: t('projectForm.visibilityStart'),
                })}
                {renderDateField({
                  id: 'my-workload-edit-visibility-end',
                  key: 'visibilityEnd',
                  label: t('projectForm.visibilityEnd'),
                })}
              </div>

              <hr className={classes.editDialogDivider} />
            </>
          )}

          {!isPlanningView && (
            <>
              <div className={classes.editDialogDateRow}>
                {renderDateField({
                  id: 'my-workload-edit-construction-start',
                  key: 'constructionStart',
                  label: t('validation.estConstructionStart'),
                  required: true,
                })}
                {renderDateField({
                  id: 'my-workload-edit-construction-end',
                  key: 'constructionEnd',
                  label: t('validation.estConstructionEnd'),
                  required: true,
                })}
              </div>

              <hr className={classes.editDialogDivider} />
            </>
          )}

          <Controller
            name="phaseId"
            control={control}
            rules={{ required: t('myWorkloadView.table.requiredField') }}
            render={({ field, fieldState: { error } }) => (
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
        </div>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <div className={classes.editDialogActionButtonRow}>
          <Button
            className={classes.editDialogActionButton}
            onClick={onSubmit}
            disabled={isLoading}
          >
            {t('save')}
          </Button>
          <Button
            className={classes.editDialogActionButton}
            onClick={onDialogClose}
            variant={ButtonVariant.Secondary}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        </div>
      </Dialog.ActionButtons>
      <div className={classes.editDialogFooterActionContainer}>
        <Button
          variant={ButtonVariant.Secondary}
          className={`${classes.editDialogActionButton} ${classes.editDialogFooterActionButton}`}
          onClick={onGoToProjectCardClick}
          disabled={!project}
        >
          {t('myWorkloadView.table.goToProjectCardEdit')}
        </Button>
      </div>
    </Dialog>
  );
};

export default MyWorkloadEditDialog;
