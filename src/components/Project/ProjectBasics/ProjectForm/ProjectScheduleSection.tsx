import { FormSectionTitle } from '@/components/shared';
import { FC, memo, useCallback, useMemo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetFieldState, UseFormGetValues, useWatch } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { Fieldset } from 'hds-react';
import DateField from '@/components/shared/DateField';
import {
  validateAfter,
  validateBefore,
  validateSameOrAfter,
  validateScheduleDateOrder,
  IScheduleDates,
} from '@/utils/validation';
import { createDateToStartOfYear, isBefore } from '@/utils/dates';

interface IProjectScheduleSectionProps {
  control: Control<IProjectForm>;
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  getFieldState: UseFormGetFieldState<IProjectForm>;
  isUserOnlyProjectManager: boolean;
  isUserOnlyViewer: boolean;
}

const ProjectScheduleSection: FC<IProjectScheduleSectionProps> = ({
  control,
  getFieldProps,
  getValues,
  getFieldState,
  isUserOnlyProjectManager,
  isUserOnlyViewer,
}) => {
  const { t } = useTranslation();

  const phases = useOptions('phases');

  // IO-863: the validators below compare against getValues('phase').value, which is
  // the phase *id*. So resolve these phase-value sets to their option ids via the
  // option label (listItemToOption maps label = phase value, value = phase id).
  // This replaces fragile index slicing (slice(3,…) / slice(7,…)) that broke when the
  // three planning phases were merged into one `planning` phase.
  const phasesThatNeedPlanning = useMemo(
    () =>
      phases
        .filter((p) =>
          [
            'designPlanning',
            'constructionWait',
            'constructionPreparation',
            'construction',
            'warrantyPeriod',
            'completed',
          ].includes(p.label),
        )
        .map((p) => p.value),
    [phases],
  );

  const phasesThatNeedConstruction = useMemo(
    () =>
      phases
        .filter((p) =>
          ['constructionPreparation', 'construction', 'warrantyPeriod', 'completed'].includes(
            p.label,
          ),
        )
        .map((p) => p.value),
    [phases],
  );

  const currentPhase = useWatch({
    control,
    name: 'phase',
  })?.value;

  const warrantyPeriodPhase = useMemo(
    () => phases.find(({ label }) => label === 'warrantyPeriod')?.value ?? '',
    [phases],
  );

  // Resolves the current schedule dates under the canonical names validateScheduleDateOrder
  // expects, since this form's own field names (estPlanningStart, etc.) differ from them.
  const getScheduleDates = useCallback(
    (): IScheduleDates => ({
      planningStart: getValues('estPlanningStart'),
      planningEnd: getValues('estPlanningEnd'),
      presenceStart: getValues('presenceStart'),
      presenceEnd: getValues('presenceEnd'),
      visibilityStart: getValues('visibilityStart'),
      visibilityEnd: getValues('visibilityEnd'),
      constructionStart: getValues('estConstructionStart'),
      constructionEnd: getValues('estConstructionEnd'),
    }),
    [getValues],
  );

  const validateEstPlanningStart = useCallback(() => {
    return {
      validate: {
        isEstPlanningStartValid: (date: string | null) => {
          const yearToBeSet = date?.split('.')[2];
          const yearInFormYearCell = getValues('planningStartYear');

          if (
            !getFieldState('planningStartYear').isDirty &&
            yearToBeSet !== yearInFormYearCell &&
            yearToBeSet
          ) {
            if (isUserOnlyProjectManager) {
              return t('validation.userIsNotAllowedToModifyPlanningStartYear');
            }
            return t('validation.planningStartYearChangingValidator');
          }

          const phase = getValues('phase').value;

          if (phasesThatNeedPlanning.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estPlanningStart') });
          }

          return validateScheduleDateOrder('planningStart', date, getScheduleDates(), t);
        },
      },
    };
  }, [getValues, getScheduleDates, phasesThatNeedPlanning, t, getFieldState, isUserOnlyProjectManager]);

  const validateEstPlanningEnd = useCallback(() => {
    return {
      validate: {
        isEstPlanningEndValid: (date: string | null) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedPlanning.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estPlanningEnd') });
          }

          return validateScheduleDateOrder('planningEnd', date, getScheduleDates(), t);
        },
      },
    };
  }, [getScheduleDates, getValues, phasesThatNeedPlanning, t]);

  const validatePresenceStart = useCallback(() => {
    return {
      validate: {
        isPresenceStartValid: (date: string | null) =>
          validateScheduleDateOrder('presenceStart', date, getScheduleDates(), t),
      },
    };
  }, [getScheduleDates, t]);

  const validatePresenceEnd = useCallback(() => {
    return {
      validate: {
        isPresenceEndValid: (date: string | null) =>
          validateScheduleDateOrder('presenceEnd', date, getScheduleDates(), t),
      },
    };
  }, [getScheduleDates, t]);

  const validateVisibilityStart = useCallback(() => {
    return {
      validate: {
        isVisibilityStartValid: (date: string | null) =>
          validateScheduleDateOrder('visibilityStart', date, getScheduleDates(), t),
      },
    };
  }, [getScheduleDates, t]);

  const validateVisibilityEnd = useCallback(() => {
    return {
      validate: {
        isVisibilityEndValid: (date: string | null) =>
          validateScheduleDateOrder('visibilityEnd', date, getScheduleDates(), t),
      },
    };
  }, [getScheduleDates, t]);

  const validateEstConstructionStart = useCallback(() => {
    return {
      validate: {
        isEstConstructionStartValid: (date: string | null) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedConstruction.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estConstructionStart') });
          }

          return validateScheduleDateOrder('constructionStart', date, getScheduleDates(), t);
        },
      },
    };
  }, [getScheduleDates, getValues, phasesThatNeedConstruction, t]);

  const validateEstConstructionEnd = useCallback(() => {
    return {
      validate: {
        isEstConstructionEndValid: (date: string | null) => {
          const yearToBeSet = date?.split('.')[2];
          const yearInFormYearCell = getValues('constructionEndYear');

          if (
            !getFieldState('constructionEndYear').isDirty &&
            yearToBeSet !== yearInFormYearCell &&
            yearToBeSet
          ) {
            return t('validation.constructionEndYearValidator');
          }

          const phase = getValues('phase').value;

          if (phasesThatNeedConstruction.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estConstructionEnd') });
          }

          const afterConstructionStart = validateScheduleDateOrder(
            'constructionEnd',
            date,
            getScheduleDates(),
            t,
          );

          if (afterConstructionStart !== true) {
            return afterConstructionStart;
          }

          const warrantyPhaseStart = getValues('estWarrantyPhaseStart');
          if (date && warrantyPhaseStart && isBefore(warrantyPhaseStart, date)) {
            return t('validation.isBefore', {
              value: t('validation.estWarrantyPhaseStart'),
            });
          }

          return true;
        },
      },
    };
  }, [getScheduleDates, getValues, phasesThatNeedConstruction, t, getFieldState]);

  const validateWarrantyPhaseStart = useCallback(() => {
    return {
      validate: {
        isWarrantyPeriodStartValid: (date: string | null) => {
          const constructionEndYear = getValues('constructionEndYear');
          const constructionEndYearStartDate = createDateToStartOfYear(constructionEndYear);

          if (date && constructionEndYear && isBefore(date, constructionEndYearStartDate)) {
            return t('validation.isSameOrAfter', {
              value: t('validation.constructionEndYear'),
            });
          }

          const sameOrAfterConstructionEnd = validateSameOrAfter(
            date,
            'estConstructionEnd',
            getValues,
            t,
          );

          if (sameOrAfterConstructionEnd !== true) {
            return sameOrAfterConstructionEnd;
          }

          const beforeWarrantyEnd = validateBefore(date, 'estWarrantyPhaseEnd', getValues, t);

          if (beforeWarrantyEnd !== true) {
            return beforeWarrantyEnd;
          }

          return true;
        },
      },
    };
  }, [getValues, t]);

  const validateWarrantyPhaseEnd = useCallback(() => {
    return {
      validate: {
        isWarrantyPhaseValid: (date: string | null) => {
          const phase = getValues('phase').value;
          const constructionEndYear = getValues('constructionEndYear');
          const constructionEndYearStartDate = createDateToStartOfYear(constructionEndYear);

          if (phase === warrantyPeriodPhase && !date) {
            return t('validation.required', { field: t('validation.estWarrantyPhaseEnd') });
          }

          if (date && constructionEndYear && isBefore(date, constructionEndYearStartDate)) {
            return t('validation.isSameOrAfter', {
              value: t('validation.constructionEndYear'),
            });
          }

          const afterWarrantyPhaseStart = validateAfter(
            date,
            'estWarrantyPhaseStart',
            getValues,
            t,
          );

          if (afterWarrantyPhaseStart !== true) {
            return afterWarrantyPhaseStart;
          }

          return true;
        },
      },
    };
  }, [getValues, t, warrantyPeriodPhase]);

  return (
    <div className="w-full" id="basics-schedule-section">
      <FormSectionTitle {...getFieldProps('schedule')} />
      <Fieldset heading={t('projectForm.planning')} className="w-full" id="planning">
        <div className="form-row">
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estPlanningStart')}
              rules={validateEstPlanningStart()}
              required={phasesThatNeedPlanning.includes(currentPhase)}
              readOnly={isUserOnlyViewer}
            />
          </div>
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estPlanningEnd')}
              rules={validateEstPlanningEnd()}
              required={phasesThatNeedPlanning.includes(currentPhase)}
              readOnly={isUserOnlyViewer}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <DateField
              {...getFieldProps('presenceStart')}
              rules={validatePresenceStart()}
              readOnly={isUserOnlyViewer}
            />
          </div>
          <div className="form-col-md">
            <DateField
              {...getFieldProps('presenceEnd')}
              rules={validatePresenceEnd()}
              readOnly={isUserOnlyViewer}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <DateField
              {...getFieldProps('visibilityStart')}
              rules={validateVisibilityStart()}
              readOnly={isUserOnlyViewer}
            />
          </div>
          <div className="form-col-md">
            <DateField
              {...getFieldProps('visibilityEnd')}
              rules={validateVisibilityEnd()}
              readOnly={isUserOnlyViewer}
            />
          </div>
        </div>
      </Fieldset>
      <Fieldset heading={t('projectForm.construction')} className="w-full" id="construction">
        <div className="form-row">
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estConstructionStart')}
              readOnly={isUserOnlyViewer}
              rules={validateEstConstructionStart()}
              required={phasesThatNeedConstruction.includes(currentPhase)}
            />
          </div>
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estConstructionEnd')}
              readOnly={isUserOnlyViewer}
              rules={validateEstConstructionEnd()}
              required={phasesThatNeedConstruction.includes(currentPhase)}
            />
          </div>
        </div>
      </Fieldset>
      <Fieldset heading={t('projectForm.warrantyPhase')} className="w-full" id="warranty">
        <div className="form-row">
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estWarrantyPhaseStart')}
              readOnly={isUserOnlyViewer}
              rules={validateWarrantyPhaseStart()}
            />
          </div>
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estWarrantyPhaseEnd')}
              readOnly={isUserOnlyViewer}
              rules={validateWarrantyPhaseEnd()}
              required={currentPhase === warrantyPeriodPhase}
            />
          </div>
        </div>
      </Fieldset>
    </div>
  );
};

export default memo(ProjectScheduleSection);
