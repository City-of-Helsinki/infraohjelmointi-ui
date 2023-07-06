import { FormSectionTitle, NumberField, SelectField } from '@/components/shared';
import { FC, memo, useMemo, useState } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { IOption } from '@/interfaces/common';
import { getToday, isBefore, updateYear } from '@/utils/dates';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';
import ErrorSummary from './ErrorSummary';
import { getFieldsIfEmpty, validateMaxNumber } from '@/utils/validation';
import _ from 'lodash';

interface IProjectStatusSectionProps {
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
}

const ProjectStatusSection: FC<IProjectStatusSectionProps> = ({ getFieldProps, getValues }) => {
  const phases = useOptions('phases');
  const categories = useOptions('categories');
  const riskAssessments = useOptions('riskAssessments');
  const constructionPhaseDetails = useOptions('constructionPhaseDetails');
  const currentPhase = getValues('phase').value;

  const { t } = useTranslation();

  const [phaseRequirements, setPhaseRequirements] = useState<Array<string>>([]);

  const [
    proposalPhase,
    designPhase,
    programmedPhase,
    draftInitiationPhase,
    draftApprovalPhase,
    constructionPlanPhase,
    constructionWaitPhase,
    constructionPhase,
    warrantyPeriodPhase,
    completedPhase,
  ] = useMemo(() => phases.map(({ value }) => value), [phases]);

  const validatePhase = useMemo(
    () => ({
      required: t('validation.required', { field: t('validation.phase') }) ?? '',
      validate: {
        isPhaseValid: (phase: IOption) => {
          if (phase.value === '') {
            return t('validation.required', { field: t('validation.phase') }) ?? '';
          }

          const phaseToSubmit = phase.value;
          const programmed = getValues('programmed');
          const fields: Array<string> = [];
          const fieldsIfEmpty = (fields: Array<string>) => getFieldsIfEmpty(fields, getValues);

          const programmedRequirements = [
            'planningStartYear',
            'constructionEndYear',
            'category',
            'masterClass',
            'class',
            'subClass',
          ];

          const planningRequirements = ['estPlanningEnd', 'estPlanningStart', 'personPlanning'];

          // Check fields that cannot be empty
          switch (phaseToSubmit) {
            case programmedPhase:
              fields.push(...fieldsIfEmpty([...programmedRequirements]));
              break;
            case draftInitiationPhase:
            case draftApprovalPhase:
            case constructionPlanPhase:
            case constructionWaitPhase:
              fields.push(...fieldsIfEmpty([...programmedRequirements, ...planningRequirements]));
              break;
            case constructionPhase:
            case warrantyPeriodPhase:
            case completedPhase:
              if (
                (phaseToSubmit === warrantyPeriodPhase || phaseToSubmit === completedPhase) &&
                isBefore(getToday(), getValues('estConstructionEnd'))
              ) {
                return t('validation.phaseTooEarly', { value: phase.label });
              }
              fields.push(
                ...fieldsIfEmpty([
                  ...programmedRequirements,
                  ...planningRequirements,
                  'estConstructionStart',
                  'estConstructionEnd',
                  'personConstruction',
                  'constructionPhaseDetail',
                ]),
              );
              break;
          }

          // Check if programmed has the correct value
          if (phase.value === proposalPhase || phase.value === designPhase) {
            if (programmed) {
              fields.push('programmed');
            }
          } else {
            if (!programmed) {
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
      getValues,
      proposalPhase,
      designPhase,
      programmedPhase,
      draftInitiationPhase,
      draftApprovalPhase,
      constructionPlanPhase,
      constructionWaitPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ],
  );

  const validateConstructionPhaseDetails = useMemo(
    () => ({
      validate: {
        isConstructionPhaseDetailsValid: (constructionPhaseDetail: IOption) => {
          const phase = getValues('phase');
          // Required after phase is changed to construction
          if (
            (phase.value === constructionPhase ||
              phase.value === warrantyPeriodPhase ||
              phase.value === completedPhase) &&
            constructionPhaseDetail?.value === ''
          ) {
            return t('validation.required', { field: t('validation.constructionPhaseDetail') });
          }
          return true;
        },
      },
    }),
    [completedPhase, constructionPhase, getValues, t, warrantyPeriodPhase],
  );

  const isConstructionPhaseDetailsDisabled = useMemo(() => {
    return (
      currentPhase !== constructionPhase &&
      currentPhase !== warrantyPeriodPhase &&
      currentPhase !== completedPhase
    );
  }, [currentPhase, constructionPhase, warrantyPeriodPhase, completedPhase]);

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

          const conEnd = getValues('constructionEndYear');
          const isAfterConstructionEnd = conEnd && parseInt(date) > parseInt(conEnd);

          // If the date is after construction end year
          if (isAfterConstructionEnd) {
            return t('validation.isBefore', {
              value: t('validation.constructionEndYear'),
            });
          }

          const estPlanningStartToUpdate = updateYear(
            parseInt(date),
            getValues('estPlanningStart'),
          );

          const isEstPlanningStartAfterEstPlanningEnd = !isBefore(
            estPlanningStartToUpdate,
            getValues('estPlanningEnd'),
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

  const validateConstructionEndYear = useMemo(
    () => ({
      ...validateMaxNumber(3000, t),
      validate: {
        isConstructionEndYearValid: (date: string | null) => {
          if (!date) {
            return true;
          }

          const planStart = getValues('planningStartYear');
          const isBeforePlanningStart = planStart && parseInt(date) < parseInt(planStart);

          // If the date is before planning start year
          if (isBeforePlanningStart) {
            return t('validation.isAfter', {
              value: t('validation.planningStartYear'),
            });
          }

          const estConstructionEndToUpdate = updateYear(
            parseInt(date),
            getValues('estConstructionEnd'),
          );

          const isEstConstructionEndBeforeEstConstructionStart = !isBefore(
            getValues('estConstructionStart'),
            estConstructionEndToUpdate,
          );

          // We also patch the estConstructionEnd value, so we need to check if the date would appear after estConstructionStart
          if (isEstConstructionEndBeforeEstConstructionStart) {
            return t('validation.isBefore', {
              value: t('validation.estConstructionStart'),
            });
          }

          return true;
        },
      },
    }),
    [getValues, t],
  );

  const validateCategory = useMemo(
    () => ({
      validate: {
        isCategoryValid: (category: IOption) => {
          const phase = getValues('phase').value;

          const phasesThatNeedCategory = phases.slice(0, 2).map(({ value }) => value);

          phasesThatNeedCategory.forEach((p) => {
            if (phase !== p && category.value === '') {
              return t('validation.required', { field: t('validation.category') });
            }
          });

          return true;
        },
      },
    }),
    [getValues, phases, t],
  );

  return (
    <div className="w-full" id="basics-status-section">
      <FormSectionTitle {...getFieldProps('status')} />
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('phase')}
            options={phases}
            rules={validatePhase}
            iconKey={getValues('phase').label}
          />
        </div>
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('constructionPhaseDetail')}
            options={constructionPhaseDetails}
            rules={validateConstructionPhaseDetails}
            disabled={isConstructionPhaseDetailsDisabled}
          />
        </div>
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
        <RadioCheckboxField {...getFieldProps('programmed')} rules={validateProgrammed} />
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField {...getFieldProps('planningStartYear')} rules={validatePlanningStartYear} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField
            {...getFieldProps('constructionEndYear')}
            rules={validateConstructionEndYear}
          />
        </div>
      </div>
      <div className="form-row">
        <RadioCheckboxField {...getFieldProps('louhi')} />
      </div>
      <div className="form-row">
        <RadioCheckboxField {...getFieldProps('gravel')} />
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('category')}
            options={categories}
            rules={validateCategory}
          />
        </div>
      </div>
      <div className="form-row">
        <RadioCheckboxField {...getFieldProps('effectHousing')} />
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField {...getFieldProps('riskAssessment')} options={riskAssessments} />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectStatusSection);
