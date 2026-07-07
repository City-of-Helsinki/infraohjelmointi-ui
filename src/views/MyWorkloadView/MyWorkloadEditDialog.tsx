import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { IListItem } from '@/interfaces/common';
import { selectProjectPhases } from '@/reducers/listsSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { usePatchProjectMutation } from '@/api/projectApi';
import TextField from '@/components/shared/TextField';
import { currencyToRequestValue, formatBudgetEuro } from '@/utils/constructionHandoverUtils';
import {
  Button,
  ButtonVariant,
  DateInput as HDSDateInput,
  Dialog,
  Option,
  Select,
  TextInput,
} from 'hds-react';
import {
  FC,
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import classes from './styles.module.css';
import { MyWorkloadViewType } from './useMyWorkloadRows';
import { normalizeMyWorkloadDate } from './myWorkloadDateUtils';
import useMyWorkloadEditForm, { IMyWorkloadEditFormValues } from './useMyWorkloadEditForm';
import { HookFormControlType } from '@/interfaces/formInterfaces';

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
  const planningPhases = useAppSelector((state) => state.lists.planningPhases);
  const [patchProject, { isLoading }] = usePatchProjectMutation();
  const planningStartFieldRef = useRef<HTMLDivElement | null>(null);
  const planningEndFieldRef = useRef<HTMLDivElement | null>(null);
  const presenceStartFieldRef = useRef<HTMLDivElement | null>(null);
  const presenceEndFieldRef = useRef<HTMLDivElement | null>(null);
  const visibilityStartFieldRef = useRef<HTMLDivElement | null>(null);
  const visibilityEndFieldRef = useRef<HTMLDivElement | null>(null);
  const constructionStartFieldRef = useRef<HTMLDivElement | null>(null);
  const constructionEndFieldRef = useRef<HTMLDivElement | null>(null);
  const { control, getValues, handleSubmit, setValue, formState, clearErrors } =
    useMyWorkloadEditForm(project);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isDesignerView = viewType === 'design';

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

    setSubmitAttempted(false);
    clearErrors();
    onClose();
    navigate(`/project/${project.id}/basics`);
  }, [clearErrors, navigate, onClose, project]);

  const onDialogClose = useCallback(() => {
    setSubmitAttempted(false);
    clearErrors();
    onClose();
  }, [clearErrors, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSubmitAttempted(false);
      clearErrors();
    }
  }, [clearErrors, isOpen]);

  const onSubmitValid = useCallback(
    async (values: IMyWorkloadEditFormValues) => {
      if (!project) {
        return;
      }

      const planningStart = values.planningStart.trim();
      const planningEnd = values.planningEnd.trim();
      const presenceStart = values.presenceStart.trim();
      const presenceEnd = values.presenceEnd.trim();
      const visibilityStart = values.visibilityStart.trim();
      const visibilityEnd = values.visibilityEnd.trim();
      const constructionStart = values.constructionStart.trim();
      const constructionEnd = values.constructionEnd.trim();
      const costForecast = currencyToRequestValue(values.costForecast);

      const formattedPlanningStart = planningStart ? normalizeMyWorkloadDate(planningStart) : null;
      const formattedPlanningEnd = planningEnd ? normalizeMyWorkloadDate(planningEnd) : null;
      const formattedPresenceStart = presenceStart ? normalizeMyWorkloadDate(presenceStart) : null;
      const formattedPresenceEnd = presenceEnd ? normalizeMyWorkloadDate(presenceEnd) : null;
      const formattedVisibilityStart = visibilityStart
        ? normalizeMyWorkloadDate(visibilityStart)
        : null;
      const formattedVisibilityEnd = visibilityEnd ? normalizeMyWorkloadDate(visibilityEnd) : null;
      const formattedConstructionStart = constructionStart
        ? normalizeMyWorkloadDate(constructionStart)
        : null;
      const formattedConstructionEnd = constructionEnd
        ? normalizeMyWorkloadDate(constructionEnd)
        : null;

      const hasDesignerValidationErrors =
        !formattedPlanningStart ||
        !formattedPlanningEnd ||
        !formattedPresenceStart ||
        !formattedPresenceEnd ||
        !formattedVisibilityStart ||
        !formattedVisibilityEnd;

      const hasConstructionValidationErrors =
        !formattedConstructionStart || !formattedConstructionEnd || !costForecast;

      const hasValidationErrors =
        !values.phaseId.trim() ||
        (isDesignerView ? hasDesignerValidationErrors : hasConstructionValidationErrors);

      if (hasValidationErrors) {
        return;
      }

      const payload = isDesignerView
        ? {
            phase: values.phaseId,
            estPlanningStart: formattedPlanningStart,
            estPlanningEnd: formattedPlanningEnd,
            presenceStart: formattedPresenceStart ?? '',
            presenceEnd: formattedPresenceEnd ?? '',
            visibilityStart: formattedVisibilityStart ?? '',
            visibilityEnd: formattedVisibilityEnd ?? '',
            projectCostForecast: values.projectCostForecast.trim(),
            planningCostForecast: values.planningCostForecast.trim(),
            planningPhase: values.planningPhaseId.trim() || null,
            planningWorkQuantity: values.planningWorkQuantity.trim(),
            constructionCostForecast: values.constructionCostForecast.trim(),
          }
        : {
            phase: values.phaseId,
            estConstructionStart: formattedConstructionStart,
            estConstructionEnd: formattedConstructionEnd,
            costForecast,
          };

      try {
        const patchedProject = await patchProject({
          id: project.id,
          data: payload,
        }).unwrap();

        onSave({
          ...project,
          planningStart: normalizeMyWorkloadDate(patchedProject.estPlanningStart),
          planningEnd: normalizeMyWorkloadDate(patchedProject.estPlanningEnd),
          presenceStart: normalizeMyWorkloadDate(patchedProject.presenceStart),
          presenceEnd: normalizeMyWorkloadDate(patchedProject.presenceEnd),
          visibilityStart: normalizeMyWorkloadDate(patchedProject.visibilityStart),
          visibilityEnd: normalizeMyWorkloadDate(patchedProject.visibilityEnd),
          constructionStart: normalizeMyWorkloadDate(patchedProject.estConstructionStart),
          constructionEnd: normalizeMyWorkloadDate(patchedProject.estConstructionEnd),
          projectCostForecast: patchedProject.projectCostForecast ?? '',
          planningCostForecast: patchedProject.planningCostForecast ?? '',
          planningPhaseId: patchedProject.planningPhase?.id ?? '',
          planningWorkQuantity: patchedProject.planningWorkQuantity ?? '',
          constructionCostForecast: patchedProject.constructionCostForecast ?? '',
          costForecast: patchedProject.costForecast ?? '',
          phase: patchedProject.phase?.value ? t(`option.${patchedProject.phase.value}`) : '',
          phaseValue: patchedProject.phase?.value ?? '',
          phaseId: patchedProject.phase?.id ?? '',
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
    [dispatch, isDesignerView, onClose, onSave, patchProject, project, t],
  );

  const onSubmit = useCallback(() => {
    setSubmitAttempted(true);
    void handleSubmit(onSubmitValid)();
  }, [handleSubmit, onSubmitValid]);

  const dateFieldError = useCallback(
    (value: string, required?: boolean) => {
      if (!submitAttempted) {
        return undefined;
      }

      if (required && !value.trim()) {
        return t('myWorkloadView.table.requiredField');
      }

      if (value.trim() && !normalizeMyWorkloadDate(value.trim())) {
        return t('myWorkloadView.table.invalidDate');
      }

      return undefined;
    },
    [submitAttempted, t],
  );

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
        render={({ field: controllerField }) => (
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
              invalid={Boolean(dateFieldError(controllerField.value ?? '', field.required))}
              errorText={dateFieldError(controllerField.value ?? '', field.required)}
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

          {isDesignerView && (
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
                  required: true,
                })}
                {renderDateField({
                  id: 'my-workload-edit-presence-end',
                  key: 'presenceEnd',
                  label: t('projectForm.presenceEnd'),
                  required: true,
                })}
              </div>

              <div className={classes.editDialogDateRow}>
                {renderDateField({
                  id: 'my-workload-edit-visibility-start',
                  key: 'visibilityStart',
                  label: t('projectForm.visibilityStart'),
                  required: true,
                })}
                {renderDateField({
                  id: 'my-workload-edit-visibility-end',
                  key: 'visibilityEnd',
                  label: t('projectForm.visibilityEnd'),
                  required: true,
                })}
              </div>

              <hr className={classes.editDialogDivider} />

              <h3 className={classes.editDialogSectionTitle}>
                {t('myWorkloadView.table.designCostEstimateSectionTitle')}
              </h3>

              <div className={classes.editDialogPlanningEstimateRow}>
                <TextField
                  id="my-workload-edit-planning-cost-forecast"
                  name="planningCostForecast"
                  label="myWorkloadView.table.costEstimate"
                  control={control as unknown as HookFormControlType}
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
                  control={control as unknown as HookFormControlType}
                  helperText={t('m2')}
                />
              </div>
              <hr className={classes.editDialogDivider} />
            </>
          )}

          {!isDesignerView && (
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
            render={({ field }) => (
              <Select
                id="my-workload-edit-phase"
                className="custom-select"
                options={phaseOptions}
                value={field.value ?? ''}
                onChange={(_, clickedOption: Option) => field.onChange(clickedOption.value)}
                texts={{
                  label: t('myWorkloadView.table.phase'),
                  placeholder: t('select'),
                }}
                required
              />
            )}
          />
          {formState.errors.phaseId && (
            <p className={classes.editDialogFieldError}>
              {formState.errors.phaseId.message as string}
            </p>
          )}

          {!isDesignerView && (
            <>
              <hr className={classes.editDialogDivider} />
              <Controller
                name="costForecast"
                control={control}
                rules={{
                  validate: (value) =>
                    currencyToRequestValue(value ?? '')
                      ? true
                      : t('myWorkloadView.table.requiredField'),
                }}
                render={({ field }) => (
                  <TextInput
                    id="my-workload-edit-cost-forecast"
                    label={t('myWorkloadView.table.totalBudget')}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={() => {
                      field.onBlur();
                      setValue('costForecast', formatBudgetEuro(getValues('costForecast')));
                    }}
                    errorText={formState.errors.costForecast?.message as string | undefined}
                    required
                  />
                )}
              />
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
