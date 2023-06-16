import { FormSectionTitle, NumberField, SelectField } from '@/components/shared';
import { FC, memo, useCallback, useState } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { IOption } from '@/interfaces/common';
import { getToday, isBefore } from '@/utils/dates';
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

  const { t } = useTranslation();

  const [phaseRequirements, setPhaseRequirements] = useState<Array<string>>([]);

  const proposalPhase = phases[0].value;
  const designPhase = phases[1].value;
  const programmedPhase = phases[2].value;
  const draftInitiationPhase = phases[3].value;
  const draftApprovalPhase = phases[4].value;
  const constructionPlanPhase = phases[5].value;
  const constructionWaitPhase = phases[6].value;
  const constructionPhase = phases[7].value;
  const warrantyPeriodPhase = phases[8].value;
  const completedPhase = phases[9].value;

  const validatePhase = useCallback(() => {
    return {
      required: t('validation.required', { field: 'validation.phase' }) ?? '',
      validate: {
        isPhaseValid: (phase: IOption) => {
          const phaseToSubmit = phase.value;
          const programmed = getValues('programmed');
          const fields: Array<string> = [];
          const fieldsIfEmpty = (fields: Array<string>) => getFieldsIfEmpty(fields, getValues);

          // Check fields that cannot be empty
          switch (phaseToSubmit) {
            case programmedPhase:
              fields.push(
                ...fieldsIfEmpty(['planningStartYear', 'constructionEndYear', 'category']),
              );
              break;
            case draftInitiationPhase:
            case draftApprovalPhase:
            case constructionPlanPhase:
            case constructionWaitPhase:
              fields.push(
                ...fieldsIfEmpty([
                  'planningStartYear',
                  'constructionEndYear',
                  'estPlanningStart',
                  'estPlanningEnd',
                  'personPlanning',
                  'category',
                ]),
              );
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
                  'planningStartYear',
                  'constructionEndYear',
                  'estPlanningStart',
                  'estPlanningEnd',
                  'estConstructionStart',
                  'estConstructionEnd',
                  'personPlanning',
                  'personConstruction',
                  'constructionPhaseDetail',
                  'category',
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
    };
  }, [
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
  ]);

  const validateConstructionPhaseDetails = useCallback(() => {
    return {
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
    };
  }, [completedPhase, constructionPhase, getValues, t, warrantyPeriodPhase]);

  const isConstructionPhaseDetailsDisabled = useCallback(() => {
    const phase = getValues('phase').value;
    return phase !== constructionPhase && phase !== warrantyPeriodPhase && phase !== completedPhase;
  }, [getValues, constructionPhase, warrantyPeriodPhase, completedPhase]);

  const validateProgrammed = useCallback(() => {
    return {
      validate: {
        isProgrammedValid: (programmed: boolean) => {
          const phase = getValues('phase');
          if (phase.value === proposalPhase || phase.value === designPhase) {
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
    };
  }, [designPhase, getValues, proposalPhase, t]);

  const validatePlanningStartYear = useCallback(() => {
    return {
      ...validateMaxNumber(3000, t),
      validate: {
        isPlanningStartYearValid: (startYear: string | null) => {
          const endYear = getValues('constructionEndYear');
          if (startYear && endYear && parseInt(startYear) > parseInt(endYear)) {
            return t('validation.isBefore', {
              value: t('validation.constructionEndYear'),
            });
          }
          return true;
        },
      },
    };
  }, [getValues, t]);

  const validateConstructionEndYear = useCallback(() => {
    return {
      ...validateMaxNumber(3000, t),
      validate: {
        isConstructionEndYearValid: (endYear: string | null) => {
          const startYear = getValues('planningStartYear');
          if (endYear && startYear && parseInt(endYear) < parseInt(startYear)) {
            return t('validation.isAfter', {
              value: t('validation.planningStartYear'),
            });
          } else {
            return true;
          }
        },
      },
    };
  }, [getValues, t]);

  const validateCategory = useCallback(() => {
    return {
      validate: {
        isCategoryValid: (category: IOption) => {
          const phase = getValues('phase').value;
          const proposalPhase = phases[0].value;
          const designPhase = phases[1].value;
          if (phase !== proposalPhase && phase !== designPhase && category.value === '') {
            return t('validation.required', { field: t('validation.category') });
          }
          return true;
        },
      },
    };
  }, [getValues, phases, t]);

  return (
    <div className="w-full" id="basics-status-section">
      <FormSectionTitle {...getFieldProps('status')} />
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField {...getFieldProps('phase')} options={phases} rules={validatePhase()} />
        </div>
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('constructionPhaseDetail')}
            options={constructionPhaseDetails}
            rules={validateConstructionPhaseDetails()}
            disabled={isConstructionPhaseDetailsDisabled()}
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
        <RadioCheckboxField {...getFieldProps('programmed')} rules={validateProgrammed()} />
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField
            {...getFieldProps('planningStartYear')}
            rules={validatePlanningStartYear()}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField
            {...getFieldProps('constructionEndYear')}
            rules={validateConstructionEndYear()}
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
            rules={validateCategory()}
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
