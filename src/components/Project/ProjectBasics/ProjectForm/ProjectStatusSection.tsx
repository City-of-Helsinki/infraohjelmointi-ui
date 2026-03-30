import { FormSectionTitle, NumberField, SelectField } from '@/components/shared';
import { FC, memo, useMemo, useState, useEffect, useCallback } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { Trans, useTranslation } from 'react-i18next';
import { IListItem, IOption } from '@/interfaces/common';
import { getToday, isBefore, updateYear } from '@/utils/dates';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';
import ErrorSummary from './ErrorSummary';
import { getFieldsIfEmpty, validateMaxNumber, validateRequiredSelect } from '@/utils/validation';
import _ from 'lodash';
import { mapIconKey } from '@/utils/common';
import { useAppSelector } from '@/hooks/common';
import { selectProjectMode } from '@/reducers/projectSlice';
import { selectProjectPhases } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import { listItemToOption } from '@/utils/common';
import { Tooltip } from 'hds-react';
import { IProject } from '@/interfaces/projectInterfaces';

interface IProjectStatusSectionProps {
  project: IProject | null;
  getValues: UseFormGetValues<IProjectForm>;
  setValue: UseFormSetValue<IProjectForm>;
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
  control,
  constructionEndYear,
  isInputDisabled,
  isUserOnlyProjectManager,
  isUserOnlyViewer,
  useWatchField,
}) => {
  const phases = useOptions('phases');
  const phasesWithIndexes = useAppSelector(selectProjectPhases);
  const allPhaseDetails = useAppSelector((state: RootState) => state.lists.projectPhaseDetails);
  const categories = useOptions('categories');
  const priorities = useOptions('priorities').toReversed(); // Higher priority first
  const constructionProcurementMethods = useOptions('constructionProcurementMethods');
  const staraProcurementReasons = useOptions('staraProcurementReasons');

  const currentPhase = getValues('phase').value;
  const { t } = useTranslation();
  const projectMode = useAppSelector(selectProjectMode);

  const filteredPhaseDetails = useMemo(() => {
    if (!currentPhase) return [];
    return allPhaseDetails
      .filter((detail) => detail.projectPhase?.id === currentPhase)
      .map((detail) => listItemToOption(detail));
  }, [allPhaseDetails, currentPhase]);

  const watchedConstructionProcurementMethod = useWatchField(
    'constructionProcurementMethod',
    control,
  ) as IOption | undefined;

  const showStaraProcurementReason = watchedConstructionProcurementMethod?.label === 'Stara';

  const [phaseRequirements, setPhaseRequirements] = useState<Array<string>>([]);

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

  const phaseValues = useMemo(() => phases.map(({ value }) => value), [phases]);
  const phaseByValue = useCallback(
    (val: string) => phaseValues.find((v) => v === val),
    [phaseValues],
  );
  const proposalPhase = phaseByValue('proposal');
  const designPhase = phaseByValue('design');
  const programmedPhase = phaseByValue('programming');
  const draftInitiationPhase = phaseByValue('draftInitiation');
  const draftApprovalPhase = phaseByValue('draftApproval');
  const constructionPlanPhase = phaseByValue('constructionPlan');
  const constructionWaitPhase = phaseByValue('constructionWait');
  const constructionPreparationPhase = phaseByValue('constructionPreparation');
  const constructionPhase = phaseByValue('construction');
  const warrantyPeriodPhase = phaseByValue('warrantyPeriod');
  const completedPhase = phaseByValue('completed');
  const suspendedPhase = phaseByValue('suspended');

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
          const programmed = getValues('programmed');
          const fields: Array<string> = [];
          const fieldsIfEmpty = (fields: Array<string>) => getFieldsIfEmpty(fields, getValues);

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

          const hasDetailsForPhase = allPhaseDetails.some(
            (d) => d.projectPhase?.id === phaseToSubmit,
          );

          // Check fields that cannot be empty
          switch (phaseToSubmit) {
            case programmedPhase:
              fields.push(...fieldsIfEmpty([...programmedRequirements]));
              if (hasDetailsForPhase) fields.push(...fieldsIfEmpty(['phaseDetail']));
              break;
            case draftInitiationPhase:
            case draftApprovalPhase:
            case constructionPlanPhase:
            case constructionWaitPhase:
              fields.push(...fieldsIfEmpty([...programmedRequirements, ...planningRequirements]));
              if (hasDetailsForPhase) fields.push(...fieldsIfEmpty(['phaseDetail']));
              break;
            case constructionPreparationPhase:
              fields.push(...fieldsIfEmpty([...combinedRequirements, 'phaseDetail']));
              break;
            case constructionPhase:
              fields.push(...fieldsIfEmpty([...combinedRequirements, 'phaseDetail']));
              break;
            case warrantyPeriodPhase:
              if (isBefore(getToday(), getValues('estConstructionEnd'))) {
                return t('validation.phaseTooEarly', { value: phase.label });
              }
              fields.push(...fieldsIfEmpty([...combinedRequirements]));
              break;
            case completedPhase:
              if (isBefore(getToday(), getValues('estConstructionEnd'))) {
                return t('validation.phaseTooEarly', { value: phase.label });
              }
              if (checkTodayIsBeforeWarrantyPhaseEnd()) {
                return t('validation.completedPhaseTooEarly');
              }
              fields.push(...fieldsIfEmpty([...combinedRequirements]));
              break;
            case suspendedPhase:
              break;
          }

          const isProposalOrDesignPhase =
            phase.value === proposalPhase || phase.value === designPhase;
          const isSuspendedPhase = phase.value === suspendedPhase;

          if (!isSuspendedPhase) {
            if (
              (isProposalOrDesignPhase && programmed) ||
              (!isProposalOrDesignPhase && !programmed)
            ) {
              fields.push('programmed');
            }
          }
          setPhaseRequirements(fields);

          return fields.length === 0;
        },
      },
    }),
    [
      t,
      isUserOnlyProjectManager,
      getValues,
      proposalPhase,
      designPhase,
      currentPhase,
      phasesWithIndexes,
      programmedPhase,
      draftInitiationPhase,
      draftApprovalPhase,
      constructionPlanPhase,
      constructionWaitPhase,
      constructionPreparationPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
      suspendedPhase,
      allPhaseDetails,
      checkTodayIsBeforeWarrantyPhaseEnd,
      projectMode,
    ],
  );

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
            return t('validation.required', {
              field: t('validation.estPlanningStart'),
            });
          }

          const estPlanningStartToUpdate = updateYear(parseInt(date), estPlanningStartValue);

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
    [getValues, t],
  );

  const validateConstructionEndYear = useCallback(
    () => ({
      ...validateMaxNumber(3000, t),
      validate: {
        isConstructionEndYearValid: (date: string | null) => {
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
            return t('validation.required', {
              field: t('validation.estConstructionEnd'),
            });
          }

          const estConstructionEndToUpdate = updateYear(parseInt(date), estConstructionEndValue);

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
    [t, constructionEndYear, isUserOnlyProjectManager, getValues],
  );

  const projectFormPhase = getValues('phase').label;
  const projectPhase = project?.phase;
  const [iconKey, setIconKey] = useState(mapIconKey(getValues('phase').label));
  useEffect(() => {
    setIconKey(mapIconKey(getValues('phase').label));
  }, [getValues, projectFormPhase, projectPhase]);

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
