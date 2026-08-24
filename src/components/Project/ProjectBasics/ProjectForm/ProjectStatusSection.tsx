import { FormSectionTitle, NumberField, SelectField } from '@/components/shared';
import { FC, memo, useMemo, useState, useEffect, useCallback } from 'react';
import { useOptions } from '@/hooks/useOptions';
import {
  Control,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
  useWatch,
} from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { Trans, useTranslation } from 'react-i18next';
import { IListItem, IOption } from '@/interfaces/common';
import { getToday, isBefore, updateYear } from '@/utils/dates';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';
import ErrorSummary from './ErrorSummary';
import { getFieldsIfEmpty, validateMaxNumber, validateRequiredSelect } from '@/utils/validation';
import { listItemToOption, mapIconKey } from '@/utils/common';
import { useAppSelector } from '@/hooks/common';
import { selectProjectMode } from '@/reducers/projectSlice';
import { selectProjectPhases } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import { Tooltip } from 'hds-react';
import { IProject } from '@/interfaces/projectInterfaces';
import useConstructionProcurementMethod from '@/hooks/useConstructionProcurementMethod';

interface IProjectStatusSectionProps {
  project: IProject | null;
  getValues: UseFormGetValues<IProjectForm>;
  setValue: UseFormSetValue<IProjectForm>;
  watch: UseFormWatch<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  control: Control<IProjectForm>;
  constructionEndYear: number | null | undefined;
  isInputDisabled: boolean;
  isUserOnlyProjectManager: boolean;
  isUserOnlyViewer: boolean;
  getFieldState: UseFormGetFieldState<IProjectForm>;
  trigger: UseFormTrigger<IProjectForm>;
  useWatchField: (
    name: keyof IProjectForm,
    control: Control<IProjectForm>,
  ) => IProjectForm[keyof IProjectForm];
}

const getPhaseIndexByPhaseId = (phaseId: string | undefined, phasesWithIndexes: IListItem[]) => {
  const phase = phasesWithIndexes.find(({ id }) => id === phaseId);
  return phase?.index;
};

const ProjectStatusSection: FC<IProjectStatusSectionProps> = ({
  project,
  getFieldProps,
  getValues,
  setValue,
  watch,
  control,
  constructionEndYear,
  isInputDisabled,
  isUserOnlyProjectManager,
  isUserOnlyViewer,
  getFieldState,
  trigger,
  useWatchField,
}) => {
  const phases = useOptions('phases');
  const phasesWithIndexes = useAppSelector(selectProjectPhases);
  const allPhaseDetails = useAppSelector((state: RootState) => state.lists.projectPhaseDetails);
  const categories = useOptions('categories');
  const priorities = useOptions('priorities').toReversed(); // Higher priority first

  const watchedPhase = useWatchField('phase', control) as IOption | undefined;
  const currentPhase = watchedPhase?.value ?? '';
  const { t } = useTranslation();
  const projectMode = useAppSelector(selectProjectMode);

  const filteredPhaseDetails = useMemo(() => {
    if (!currentPhase) return [];
    return allPhaseDetails
      .filter((detail) => detail.projectPhase?.id === currentPhase)
      .map((detail) => listItemToOption(detail));
  }, [allPhaseDetails, currentPhase]);

  const { constructionProcurementMethods, staraProcurementReasons, showStaraProcurementReason } =
    useConstructionProcurementMethod(
      watch,
      setValue,
      'constructionProcurementMethod',
      'staraProcurementReason',
    );

  // Watch all fields that are checked in phaseRequirements so the ErrorSummary updates live
  const watchedRequiredFields = useWatch({
    control,
    name: [
      'planningStartYear',
      'constructionEndYear',
      'estPlanningStart',
      'estConstructionEnd',
      'category',
      'masterClass',
      'class',
      'address',
      'phaseDetail',
      'estPlanningEnd',
      'personPlanning',
      'estConstructionStart',
      'personConstruction',
    ],
  });

  useEffect(() => {
    const currentDetail = getValues('phaseDetail');
    if (currentDetail?.value) {
      const detailBelongsToPhase = allPhaseDetails.some(
        (d) => d.id === currentDetail.value && d.projectPhase?.id === currentPhase,
      );
      if (!detailBelongsToPhase) {
        setValue('phaseDetail', { value: '', label: '' }, { shouldDirty: true });
      }
    }
  }, [currentPhase, allPhaseDetails, getValues, setValue]);

  // Re-run phaseDetail's validation whenever phase changes so stale errors
  // are cleared once phaseDetail is no longer required
  useEffect(() => {
    if (getFieldState('phaseDetail').invalid) {
      trigger('phaseDetail');
    }
  }, [currentPhase, filteredPhaseDetails.length, getFieldState, trigger]);

  useEffect(() => {
    if (!showStaraProcurementReason) {
      setValue('staraProcurementReason', { value: '', label: '' }, { shouldDirty: true });
    }
  }, [showStaraProcurementReason, setValue]);

  const checkPhaseIsBeforeCurrent = (
    previousPhaseIndex: number | undefined,
    newPhaseIndex: number | undefined,
  ) => {
    return (
      newPhaseIndex !== undefined &&
      previousPhaseIndex !== undefined &&
      newPhaseIndex < previousPhaseIndex
    );
  };

  const checkTodayIsBeforeWarrantyPhaseEnd = useCallback(() => {
    return (
      getValues('estWarrantyPhaseEnd') && isBefore(getToday(), getValues('estWarrantyPhaseEnd'))
    );
  }, [getValues]);

  const phaseByValue = useCallback(
    (val: string) => phases.find((phase) => phase.label === val)?.value ?? '',
    [phases],
  );
  const proposalPhase = phaseByValue('proposal');
  const designPhase = phaseByValue('design');
  const programmedPhase = phaseByValue('programming');
  const planningPhase = phaseByValue('designPlanning');
  const constructionWaitPhase = phaseByValue('constructionWait');
  const constructionPreparationPhase = phaseByValue('constructionPreparation');
  const constructionPhase = phaseByValue('construction');
  const warrantyPeriodPhase = phaseByValue('warrantyPeriod');
  const completedPhase = phaseByValue('completed');
  const phasesThatNeedYearBounds = useMemo(
    () =>
      [
        programmedPhase,
        planningPhase,
        constructionWaitPhase,
        constructionPreparationPhase,
        constructionPhase,
        warrantyPeriodPhase,
        completedPhase,
      ].filter((phase): phase is string => phase !== ''),
    [
      programmedPhase,
      planningPhase,
      constructionWaitPhase,
      constructionPreparationPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ],
  );

  const validatePhase = useMemo(
    () => ({
      required: t('validation.required', { field: t('validation.phase') }) ?? '',
      validate: {
        isPhaseValid: (phase: IOption) => {
          if (phase.value === '') {
            return t('validation.required', { field: t('validation.phase') }) ?? '';
          }

          if (isUserOnlyProjectManager) {
            const previousPhaseIndex = getPhaseIndexByPhaseId(currentPhase, phasesWithIndexes);
            const newPhaseIndex = getPhaseIndexByPhaseId(phase.value, phasesWithIndexes);
            if (checkPhaseIsBeforeCurrent(previousPhaseIndex, newPhaseIndex)) {
              return t('validation.userNotAllowedToChangePhaseBackwards');
            }
          }

          const phaseToSubmit = phase.value;
          switch (phaseToSubmit) {
            case warrantyPeriodPhase:
              if (isBefore(getToday(), getValues('estConstructionEnd'))) {
                return t('validation.phaseTooEarly', { value: phase.label });
              }
              break;
            case completedPhase:
              if (isBefore(getToday(), getValues('estConstructionEnd'))) {
                return t('validation.phaseTooEarly', { value: phase.label });
              }
              if (checkTodayIsBeforeWarrantyPhaseEnd()) {
                return t('validation.completedPhaseTooEarly');
              }
              break;
          }

          return true;
        },
      },
    }),
    [
      t,
      isUserOnlyProjectManager,
      getValues,
      currentPhase,
      phasesWithIndexes,
      warrantyPeriodPhase,
      completedPhase,
      checkTodayIsBeforeWarrantyPhaseEnd,
    ],
  );

  // Computed live from watched values — updates whenever a field is filled or cleared
  const phaseRequirements = useMemo(() => {
    const phase = getValues('phase').value;
    const fieldsIfEmpty = (fields: Array<string>) => getFieldsIfEmpty(fields, getValues);
    const fields: Array<string> = [];

    const programmedRequirements = [
      'planningStartYear',
      'constructionEndYear',
      'estPlanningStart',
      'estConstructionEnd',
      'category',
      'masterClass',
      'class',
    ];

    if (projectMode === 'new') {
      programmedRequirements.push('address');
    }

    const planningRequirements = ['estPlanningEnd', 'estPlanningStart', 'personPlanning'];
    const generalConstructionRequirements = [
      'estConstructionStart',
      'estConstructionEnd',
      'personConstruction',
    ];
    const combinedRequirements = [
      ...programmedRequirements,
      ...planningRequirements,
      ...generalConstructionRequirements,
    ];

    const hasDetailsForPhase = allPhaseDetails.some((d) => d.projectPhase?.id === phase);

    switch (phase) {
      case programmedPhase:
        fields.push(...fieldsIfEmpty([...programmedRequirements]));
        break;
      case planningPhase:
      case constructionWaitPhase:
        fields.push(...fieldsIfEmpty([...programmedRequirements, ...planningRequirements]));
        break;
      case constructionPreparationPhase:
      case constructionPhase:
      case warrantyPeriodPhase:
      case completedPhase:
        fields.push(...fieldsIfEmpty([...combinedRequirements]));
        break;
    }

    if (hasDetailsForPhase) {
      fields.push(...fieldsIfEmpty(['phaseDetail']));
    }

    return fields;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allPhaseDetails,
    getValues,
    projectMode,
    programmedPhase,
    planningPhase,
    constructionWaitPhase,
    constructionPreparationPhase,
    constructionPhase,
    warrantyPeriodPhase,
    completedPhase,
    // watchedRequiredFields causes recomputation when any of the watched fields change
    watchedRequiredFields,
  ]);

  const validatePhaseDetails = useMemo(
    () => ({
      validate: {
        isPhaseDetailValid: (phaseDetail: IOption) => {
          const phase = getValues('phase');
          const hasDetailsForPhase = allPhaseDetails.some(
            (d) => d.projectPhase?.id === phase.value,
          );
          if (hasDetailsForPhase && (!phaseDetail || phaseDetail.value === '')) {
            return t('validation.required', { field: t('validation.phaseDetail') });
          }
          return true;
        },
      },
    }),
    [allPhaseDetails, getValues, t],
  );

  const isPhaseDetailsDisabled = useMemo(() => {
    return filteredPhaseDetails.length === 0;
  }, [filteredPhaseDetails]);

  const validateProgrammed = useMemo(
    () => ({
      validate: {
        isProgrammedValid: (programmed: boolean) => {
          const phase = getValues('phase');
          const isSuspended = getValues('phaseDetail')?.value === 'suspended';
          if (isSuspended) {
            return true;
          }
          if (phase.value === proposalPhase || phase.value === designPhase || phase.value === '') {
            return programmed
              ? t('validation.requiredFalse', { field: t('validation.programmed') })
              : true;
          } else {
            return programmed
              ? true
              : t('validation.requiredTrue', { field: t('validation.programmed') });
          }
        },
      },
    }),
    [designPhase, getValues, proposalPhase, t],
  );

  const validatePlanningStartYear = useMemo(
    () => ({
      ...validateMaxNumber(3000, t),
      validate: {
        isPlanningStartYearValid: (date: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedYearBounds.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.planningStartYear') });
          }

          if (!date) {
            return true;
          }

          const estPlanningStartValue = getValues('estPlanningStart');
          const estPlanningEndValue = getValues('estPlanningEnd');
          const constructionEndYearValue = getValues('constructionEndYear');

          const isAfterConstructionEnd =
            constructionEndYearValue && parseInt(date) > parseInt(constructionEndYearValue);

          // If the date is after construction end year
          if (isAfterConstructionEnd) {
            return t('validation.isBefore', {
              value: t('validation.constructionEndYear'),
            });
          }

          if (!estPlanningStartValue) {
            // estPlanningStart has its own validator; skip the cross-field check
            return true;
          }

          const estPlanningStartToUpdate = updateYear(parseInt(date), estPlanningStartValue);

          if (!estPlanningStartToUpdate) {
            return true;
          }

          const isEstPlanningStartAfterEstPlanningEnd = !isBefore(
            estPlanningStartToUpdate,
            estPlanningEndValue,
          );

          // We also patch the estPlanningStart value, so we need to check if the date would appear after estPlanningEnd
          if (isEstPlanningStartAfterEstPlanningEnd) {
            return t('validation.isBefore', {
              value: t('validation.estPlanningEnd'),
            });
          }

          return true;
        },
      },
    }),
    [getValues, phasesThatNeedYearBounds, t],
  );

  const validateConstructionEndYear = useCallback(
    () => ({
      ...validateMaxNumber(3000, t),
      validate: {
        isConstructionEndYearValid: (date: string | null) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedYearBounds.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.constructionEndYear') });
          }

          if (!date) {
            return true;
          }

          const estConstructionStartValue = getValues('estConstructionStart');
          const estConstructionEndValue = getValues('estConstructionEnd');
          const planningStartYearValue = getValues('planningStartYear');
          const isBeforePlanningStart =
            planningStartYearValue && parseInt(date) < parseInt(planningStartYearValue);

          if (
            isUserOnlyProjectManager &&
            constructionEndYear &&
            constructionEndYear > parseInt(date)
          ) {
            return t('validation.userNotAllowedToChangeYearBackwards');
          }

          // If the date is before planning start year
          if (isBeforePlanningStart) {
            return t('validation.isAfter', {
              value: t('validation.planningStartYear'),
            });
          }

          if (!estConstructionEndValue) {
            // estConstructionEnd has its own validator; skip the cross-field check
            return true;
          }

          const estConstructionEndToUpdate = updateYear(parseInt(date), estConstructionEndValue);

          if (!estConstructionEndToUpdate) {
            return true;
          }

          // Est construction start is not required for phases until construction phase
          if (!estConstructionStartValue) return true;

          const isEstConstructionEndBeforeEstConstructionStart = isBefore(
            estConstructionEndToUpdate,
            estConstructionStartValue,
          );

          // We also patch the estConstructionEnd value, so we need to check if the date would appear after estConstructionStart
          if (isEstConstructionEndBeforeEstConstructionStart) {
            return t('validation.isAfter', {
              value: t('validation.estConstructionStart'),
            });
          }

          return true;
        },
      },
    }),
    [t, constructionEndYear, isUserOnlyProjectManager, getValues, phasesThatNeedYearBounds],
  );

  const projectPhase = project?.phase;
  const [iconKey, setIconKey] = useState(() => mapIconKey(watchedPhase?.label ?? ''));
  useEffect(() => {
    setIconKey(mapIconKey(watchedPhase?.label ?? ''));
  }, [watchedPhase?.label, projectPhase]);

  return (
    <div className="w-full" id="basics-status-section">
      <FormSectionTitle {...getFieldProps('status')} />
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('phase')}
            options={phases}
            rules={validatePhase}
            iconKey={iconKey}
            shouldUpdateIcon={true}
            readOnly={isUserOnlyViewer}
          />
        </div>
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('phaseDetail')}
            options={filteredPhaseDetails}
            rules={validatePhaseDetails}
            disabled={isPhaseDetailsDisabled}
            required={filteredPhaseDetails.length > 0}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('constructionProcurementMethod')}
            options={constructionProcurementMethods}
            readOnly={isUserOnlyViewer}
            clearable
          />
        </div>
        {showStaraProcurementReason && (
          <div className="form-col-xl">
            <SelectField
              {...getFieldProps('staraProcurementReason')}
              options={staraProcurementReasons}
              readOnly={isUserOnlyViewer}
              clearable
            />
          </div>
        )}
      </div>
      {/* Error summary since phase has many requirements  */}
      {phaseRequirements.length > 0 && (
        <div className="form-row">
          <div className="error-summary-col">
            <ErrorSummary fields={phaseRequirements} />
          </div>
        </div>
      )}

      <div className="form-row">
        <RadioCheckboxField
          {...getFieldProps('programmed')}
          rules={validateProgrammed}
          disabled={isInputDisabled}
          readOnly={isUserOnlyViewer}
        />
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField
            {...getFieldProps('planningStartYear')}
            rules={validatePlanningStartYear}
            required={phasesThatNeedYearBounds.includes(currentPhase)}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField
            {...getFieldProps('constructionEndYear')}
            rules={validateConstructionEndYear()}
            required={phasesThatNeedYearBounds.includes(currentPhase)}
            disabled={isUserOnlyProjectManager ? false : isInputDisabled}
            readOnly={isUserOnlyViewer}
          />
        </div>
      </div>
      <div className="form-row">
        <RadioCheckboxField {...getFieldProps('louhi')} readOnly={isUserOnlyViewer} />
      </div>
      <div className="form-row">
        <RadioCheckboxField {...getFieldProps('gravel')} readOnly={isUserOnlyViewer} />
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('category')}
            options={categories}
            required
            rules={validateRequiredSelect('category', t)}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
            clearable
            tooltip={
              <Tooltip>
                <Trans
                  i18nKey="projectForm.categoryTooltip"
                  components={{ p: <p />, strong: <strong /> }}
                />
              </Tooltip>
            }
          />
        </div>
      </div>
      <div className="form-row">
        <RadioCheckboxField
          {...getFieldProps('effectHousing')}
          disabled={isInputDisabled}
          readOnly={isUserOnlyViewer}
        />
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('priority')}
            options={priorities}
            disabled={isInputDisabled}
            readOnly={isUserOnlyViewer}
            required
            rules={validateRequiredSelect('priority', t)}
            clearable
            tooltip={
              <Tooltip>
                <Trans
                  i18nKey="projectForm.priorityTooltip"
                  components={{ p: <p />, strong: <strong /> }}
                />
              </Tooltip>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectStatusSection);
