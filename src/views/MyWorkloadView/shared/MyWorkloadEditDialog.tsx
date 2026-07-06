import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { selectProjectPhases } from '@/reducers/listsSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { usePatchProjectMutation } from '@/api/projectApi';
import { formatDateToHds } from '@/utils/dates';
import {
  Button,
  ButtonVariant,
  DateInput as HDSDateInput,
  Dialog,
  Option,
  Select,
  TextInput,
} from 'hds-react';
import moment from 'moment';
import {
  ChangeEvent,
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import classes from '../styles.module.css';

interface MyWorkloadEditDialogProps {
  isOpen: boolean;
  project: MyWorkloadTableRow | null;
  onClose: () => void;
  onSave: (row: MyWorkloadTableRow) => void;
}

interface IFormState {
  projectName: string;
  description: string;
  planningStart: string;
  planningEnd: string;
  phaseId: string;
}

const emptyForm: IFormState = {
  projectName: '',
  description: '',
  planningStart: '',
  planningEnd: '',
  phaseId: '',
};

const toDisplayDate = (date?: string | null): string => {
  if (!date) {
    return '';
  }

  const parsed = moment(date, ['DD.MM.YYYY', 'D.M.YYYY'], true);
  return parsed.isValid() ? parsed.format('D.M.YYYY') : '';
};

const MyWorkloadEditDialog: FC<MyWorkloadEditDialogProps> = ({
  isOpen,
  project,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const phases = useAppSelector(selectProjectPhases);
  const [patchProject, { isLoading }] = usePatchProjectMutation();
  const planningStartFieldRef = useRef<HTMLDivElement | null>(null);
  const planningEndFieldRef = useRef<HTMLDivElement | null>(null);

  const [formState, setFormState] = useState<IFormState>(emptyForm);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!project) {
      setFormState(emptyForm);
      setSubmitAttempted(false);
      return;
    }

    setFormState({
      projectName: project.projectName,
      description: project.description,
      planningStart: project.planningStartRaw || project.planningStart,
      planningEnd: project.planningEndRaw || project.planningEnd,
      phaseId: project.phaseId,
    });
    setSubmitAttempted(false);
  }, [project]);

  const phaseOptions = useMemo(
    () =>
      phases.map((phase) => ({
        value: phase.id,
        label: t(`option.${phase.value}`),
      })),
    [phases, t],
  );

  const currentPhaseOption = useMemo(
    () => phaseOptions.find((option) => option.value === formState.phaseId),
    [phaseOptions, formState.phaseId],
  );

  const fieldError = useCallback(
    (value: string) => {
      if (!submitAttempted) {
        return undefined;
      }

      if (value.trim()) {
        return undefined;
      }

      return t('adminFunctions.menus.requiredField');
    },
    [submitAttempted, t],
  );

  const onInputChange = useCallback(
    (key: keyof IFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [key]: event.target.value }));
    },
    [],
  );

  const onDateChange = useCallback(
    (key: 'planningStart' | 'planningEnd') => (value: string) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const openDatePicker = useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
    const button = containerRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  }, []);

  const onDateInputClick = useCallback(
    (containerRef: React.RefObject<HTMLDivElement>) => (event: MouseEvent<HTMLInputElement>) => {
      event.stopPropagation();
      openDatePicker(containerRef);
    },
    [openDatePicker],
  );

  const onPhaseChange = useCallback((_: Option[], clickedOption: Option) => {
    setFormState((prev) => ({ ...prev, phaseId: clickedOption.value }));
  }, []);

  const onSubmit = useCallback(async () => {
    if (!project) {
      return;
    }

    setSubmitAttempted(true);

    const projectName = formState.projectName.trim();
    const description = formState.description.trim();
    const planningStart = formState.planningStart.trim();
    const planningEnd = formState.planningEnd.trim();

    const formattedPlanningStart = planningStart ? formatDateToHds(planningStart) : null;
    const formattedPlanningEnd = planningEnd ? formatDateToHds(planningEnd) : null;

    const hasValidationErrors =
      !projectName ||
      !description ||
      !formState.phaseId.trim() ||
      (planningStart && !formattedPlanningStart) ||
      (planningEnd && !formattedPlanningEnd);

    if (hasValidationErrors) {
      return;
    }

    try {
      const patchedProject = await patchProject({
        id: project.id,
        data: {
          name: projectName,
          description,
          phase: formState.phaseId,
          estPlanningStart: formattedPlanningStart,
          estPlanningEnd: formattedPlanningEnd,
        },
      }).unwrap();

      onSave({
        ...project,
        projectName,
        description,
        planningStart: toDisplayDate(patchedProject.estPlanningStart),
        planningEnd: toDisplayDate(patchedProject.estPlanningEnd),
        phase: patchedProject.phase?.value ? t(`option.${patchedProject.phase.value}`) : '',
        phaseValue: patchedProject.phase?.value ?? '',
        phaseId: patchedProject.phase?.id ?? '',
        planningStartRaw: patchedProject.estPlanningStart ?? '',
        planningEndRaw: patchedProject.estPlanningEnd ?? '',
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
  }, [dispatch, formState, onClose, onSave, patchProject, project, t]);

  return (
    <Dialog
      isOpen={isOpen}
      close={onClose}
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
          <TextInput
            id="my-workload-edit-name"
            label={t('projectForm.name')}
            value={formState.projectName}
            onChange={onInputChange('projectName')}
            errorText={fieldError(formState.projectName)}
            required
          />

          <TextInput
            id="my-workload-edit-description"
            label={t('projectForm.description')}
            value={formState.description}
            onChange={onInputChange('description')}
            errorText={fieldError(formState.description)}
            required
          />

          <div className={classes.editDialogDateRow}>
            <div
              ref={planningStartFieldRef}
              className={`input-wrapper date-field-wrapper ${classes.editDialogDateField}`}
            >
              <HDSDateInput
                className="input-xl date-input"
                id="my-workload-edit-planning-start"
                label={t('myWorkloadView.table.planningStart')}
                value={formState.planningStart}
                onChange={onDateChange('planningStart')}
                onClick={onDateInputClick(planningStartFieldRef)}
                placeholder=""
                language="fi"
                initialMonth={new Date()}
              />
            </div>

            <div
              ref={planningEndFieldRef}
              className={`input-wrapper date-field-wrapper ${classes.editDialogDateField}`}
            >
              <HDSDateInput
                className="input-xl date-input"
                id="my-workload-edit-planning-end"
                label={t('myWorkloadView.table.planningEnd')}
                value={formState.planningEnd}
                onChange={onDateChange('planningEnd')}
                onClick={onDateInputClick(planningEndFieldRef)}
                placeholder=""
                language="fi"
                initialMonth={new Date()}
              />
            </div>
          </div>

          <Select
            id="my-workload-edit-phase"
            className="custom-select"
            options={phaseOptions}
            value={currentPhaseOption?.value ?? ''}
            onChange={onPhaseChange}
            texts={{
              label: t('myWorkloadView.table.phase'),
              placeholder: t('select'),
            }}
            required
          />
          {submitAttempted && !formState.phaseId.trim() && (
            <p className={classes.editDialogFieldError}>
              {t('adminFunctions.menus.requiredField')}
            </p>
          )}
        </div>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={onSubmit} disabled={isLoading}>
          {t('save')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.Secondary} disabled={isLoading}>
          {t('cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default MyWorkloadEditDialog;
