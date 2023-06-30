import { FormSectionTitle } from '@/components/shared';
import { FC, memo, useCallback, useMemo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { Fieldset } from 'hds-react';
import DateField from '@/components/shared/DateField';
import { validateAfter, validateBefore } from '@/utils/validation';
import _ from 'lodash';

interface IProjectScheduleSectionProps {
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
}

const ProjectScheduleSection: FC<IProjectScheduleSectionProps> = ({ getFieldProps, getValues }) => {
  const { t } = useTranslation();

  const phases = useOptions('phases');

  const phasesThatNeedPlanning = useMemo(
    () => phases?.slice(2, phases.length - 1).map(({ value }) => value),
    [phases],
  );

  const phasesThatNeedConstruction = useMemo(
    () => phases?.slice(6, phases.length - 1).map(({ value }) => value),
    [phases],
  );

  const validateEstPlanningStart = useCallback(() => {
    return {
      validate: {
        isEstPlanningStartValid: (date: string | null) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedPlanning.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estPlanningStart') });
          }

          const beforePlanningEnd = validateBefore(date, 'estPlanningEnd', getValues, t);

          if (beforePlanningEnd !== true) {
            return beforePlanningEnd;
          }

          return true;
        },
      },
    };
  }, [getValues, phasesThatNeedPlanning, t]);

  const validateEstPlanningEnd = useCallback(() => {
    return {
      validate: {
        isEstPlanningEndValid: (date: string | null) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedPlanning.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estPlanningEnd') });
          }

          const afterPlanningStart = validateAfter(date, 'estPlanningStart', getValues, t);

          if (afterPlanningStart !== true) {
            return afterPlanningStart;
          }

          return true;
        },
      },
    };
  }, [getValues, phasesThatNeedPlanning, t]);

  const validatePresenceStart = useCallback(() => {
    return {
      validate: {
        isPresenceStartValid: (date: string | null) => {
          const beforePresenceEnd = validateBefore(date, 'presenceEnd', getValues, t);

          if (beforePresenceEnd !== true) {
            return beforePresenceEnd;
          }

          const afterPlanningStart = validateAfter(date, 'estPlanningStart', getValues, t);

          if (afterPlanningStart !== true) {
            return afterPlanningStart;
          }

          const beforePlanningEnd = validateBefore(date, 'estPlanningEnd', getValues, t);

          if (beforePlanningEnd !== true) {
            return beforePlanningEnd;
          }

          return true;
        },
      },
    };
  }, [getValues, t]);

  const validatePresenceEnd = useCallback(() => {
    return {
      validate: {
        isPresenceEndValid: (date: string | null) => {
          const afterPresenceStart = validateAfter(date, 'presenceStart', getValues, t);

          if (afterPresenceStart !== true) {
            return afterPresenceStart;
          }

          const beforePlanningEnd = validateBefore(date, 'estPlanningEnd', getValues, t);

          if (beforePlanningEnd !== true) {
            return beforePlanningEnd;
          }

          return true;
        },
      },
    };
  }, [getValues, t]);

  const validateVisibilityStart = useCallback(() => {
    return {
      validate: {
        isVisibilityStartValid: (date: string | null) => {
          const beforeVisibilityEnd = validateBefore(date, 'visibilityEnd', getValues, t);

          if (beforeVisibilityEnd !== true) {
            return beforeVisibilityEnd;
          }

          const afterPlanningStarts = validateAfter(date, 'estPlanningStart', getValues, t);

          if (afterPlanningStarts !== true) {
            return afterPlanningStarts;
          }

          return true;
        },
      },
    };
  }, [getValues, t]);

  const validateVisibilityEnd = useCallback(() => {
    return {
      validate: {
        isVisibilityEndValid: (date: string | null) => {
          const afterVisibilityStart = validateAfter(date, 'visibilityStart', getValues, t);

          if (afterVisibilityStart !== true) {
            return afterVisibilityStart;
          }

          const beforePlanningEnds = validateBefore(date, 'estPlanningEnd', getValues, t);

          if (beforePlanningEnds !== true) {
            return beforePlanningEnds;
          }

          return true;
        },
      },
    };
  }, [getValues, t]);

  const validateEstConstructionStart = useCallback(() => {
    return {
      validate: {
        isEstConstructionStartValid: (date: string | null) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedConstruction.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estConstructionStart') });
          }

          const afterPlanningEnd = validateAfter(date, 'estPlanningEnd', getValues, t);

          if (afterPlanningEnd !== true) {
            return afterPlanningEnd;
          }

          const beforeConstructionEnd = validateBefore(date, 'estConstructionEnd', getValues, t);

          if (beforeConstructionEnd !== true) {
            return validateBefore(date, 'estConstructionEnd', getValues, t);
          }

          return true;
        },
      },
    };
  }, [getValues, phasesThatNeedConstruction, t]);

  const validateEstConstructionEnd = useCallback(() => {
    return {
      validate: {
        isEstConstructionEndValid: (date: string | null) => {
          const phase = getValues('phase').value;

          if (phasesThatNeedConstruction.includes(phase) && !date) {
            return t('validation.required', { field: t('validation.estConstructionEnd') });
          }

          const afterConstructionStart = validateAfter(date, 'estConstructionStart', getValues, t);

          if (afterConstructionStart !== true) {
            return validateAfter(date, 'estConstructionStart', getValues, t);
          }

          return true;
        },
      },
    };
  }, [getValues, phasesThatNeedConstruction, t]);

  return (
    <div className="w-full" id="basics-schedule-section">
      <FormSectionTitle {...getFieldProps('schedule')} />
      <Fieldset heading={t('projectForm.planning')} className="w-full" id="planning">
        <div className="form-row">
          <div className="form-col-md">
            <DateField {...getFieldProps('estPlanningStart')} rules={validateEstPlanningStart()} />
          </div>
          <div className="form-col-md">
            <DateField {...getFieldProps('estPlanningEnd')} rules={validateEstPlanningEnd()} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <DateField {...getFieldProps('presenceStart')} rules={validatePresenceStart()} />
          </div>
          <div className="form-col-md">
            <DateField {...getFieldProps('presenceEnd')} rules={validatePresenceEnd()} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <DateField {...getFieldProps('visibilityStart')} rules={validateVisibilityStart()} />
          </div>
          <div className="form-col-md">
            <DateField {...getFieldProps('visibilityEnd')} rules={validateVisibilityEnd()} />
          </div>
        </div>
      </Fieldset>
      <Fieldset heading={t('projectForm.construction')} className="w-full" id="construction">
        <div className="form-row">
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estConstructionStart')}
              rules={validateEstConstructionStart()}
            />
          </div>
          <div className="form-col-md">
            <DateField
              {...getFieldProps('estConstructionEnd')}
              rules={validateEstConstructionEnd()}
            />
          </div>
        </div>
      </Fieldset>
    </div>
  );
};

export default memo(ProjectScheduleSection);
