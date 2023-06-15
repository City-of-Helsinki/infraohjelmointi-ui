import { FormSectionTitle } from '@/components/shared';
import { FC, memo, useCallback } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { isBefore } from '@/utils/dates';
import { Fieldset } from 'hds-react';
import _ from 'lodash';
import DateField from '@/components/shared/DateField';

interface IProjectScheduleSectionProps {
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isFieldDirty: (field: string) =>
    | boolean
    | {
        label?: boolean | undefined;
        value?: boolean | undefined;
        name?: boolean | undefined;
      }
    | boolean[]
    | undefined;
}

const ProjectScheduleSection: FC<IProjectScheduleSectionProps> = ({
  getFieldProps,
  getValues,
  isFieldDirty,
}) => {
  const { t } = useTranslation();

  const phases = useOptions('phases');

  const draftInitiationPhase = phases[3].value;
  const draftApprovalPhase = phases[4].value;
  const constructionPlanPhase = phases[5].value;
  const constructionWaitPhase = phases[6].value;
  const constructionPhase = phases[7].value;
  const warrantyPeriodPhase = phases[8].value;
  const completedPhase = phases[9].value;

  const phasesThatNeedPlanning = [
    draftInitiationPhase,
    draftApprovalPhase,
    constructionPlanPhase,
    constructionWaitPhase,
    constructionPhase,
    warrantyPeriodPhase,
    completedPhase,
  ];

  const validateEstPlanningStart = useCallback(() => {
    return {
      validate: {
        isRequired: (startDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedPlanning.includes(phase) && !startDate) {
            return t('validation.required', { field: t('validation.estPlanningStart') });
          }
          return true;
        },
        isBeforeEndDate: (startDate: string | null) => {
          if (isFieldDirty('estPlanningStart')) {
            if (!isBefore(startDate, getValues('estPlanningEnd'))) {
              return t('validation.isBefore', {
                start: t('validation.estPlanningStart'),
                end: t('validation.estPlanningEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

  const validateEstPlanningEnd = useCallback(() => {
    return {
      validate: {
        isRequired: (endDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedPlanning.includes(phase) && !endDate) {
            return t('validation.required', { field: t('validation.estPlanningEnd') });
          }
          return true;
        },
        isAfterStartDate: (endDate: string | null) => {
          if (isFieldDirty('estPlanningEnd')) {
            if (!isBefore(getValues('estPlanningStart'), endDate)) {
              return t('validation.isAfter', {
                start: t('validation.estPlanningStart'),
                end: t('validation.estPlanningEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

  const phasesThatNeedConstruction = [constructionPhase, warrantyPeriodPhase, completedPhase];

  const validateEstConstructionStart = useCallback(() => {
    return {
      validate: {
        isRequired: (startDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedConstruction.includes(phase) && !startDate) {
            return t('validation.required', { field: t('validation.estConstructionStart') });
          }
          return true;
        },
        isBeforeEndDate: (startDate: string | null) => {
          if (isFieldDirty('estConstructionStart')) {
            if (!isBefore(startDate, getValues('estConstructionEnd'))) {
              return t('validation.isBefore', {
                start: t('validation.estConstructionStart'),
                end: t('validation.estConstructionEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

  const validateEstConstructionEnd = useCallback(() => {
    return {
      validate: {
        isRequired: (endDate: string | null) => {
          const phase = getValues('phase').value;
          if (phasesThatNeedConstruction.includes(phase) && !endDate) {
            return t('validation.required', { field: t('validation.estConstructionEnd') });
          }
          return true;
        },
        isAfterStartDate: (endDate: string | null) => {
          if (isFieldDirty('estConstructionEnd')) {
            if (!isBefore(getValues('estConstructionStart'), endDate)) {
              return t('validation.isAfter', {
                start: t('validation.estConstructionStart'),
                end: t('validation.estConstructionEnd'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [getValues, isFieldDirty, t]);

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
            <DateField {...getFieldProps('presenceStart')} />
          </div>
          <div className="form-col-md">
            <DateField {...getFieldProps('presenceEnd')} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col-md">
            <DateField {...getFieldProps('visibilityStart')} />
          </div>
          <div className="form-col-md">
            <DateField {...getFieldProps('visibilityEnd')} />
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
