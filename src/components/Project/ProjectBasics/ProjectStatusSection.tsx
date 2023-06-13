import { FormSectionTitle, NumberField, SelectField } from '@/components/shared';
import { FC, memo, useCallback, useMemo } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectBasicsForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { IOption } from '@/interfaces/common';
import { getToday, isBefore } from '@/utils/dates';
import { IconAlertCircleFill } from 'hds-react';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';
import _ from 'lodash';

interface IProjectStatusSectionProps {
  getValues: UseFormGetValues<IProjectBasicsForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectBasicsForm>;
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

const ProjectStatusSection: FC<IProjectStatusSectionProps> = ({
  getFieldProps,
  getValues,
  isFieldDirty,
}) => {
  const phases = useOptions('phases');
  const categories = useOptions('categories');
  const riskAssessments = useOptions('riskAssessments');
  const constructionPhaseDetails = useOptions('constructionPhaseDetails');

  const { t } = useTranslation();

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

  const numberMax3000 = useMemo(
    () => ({
      min: {
        value: 0,
        message: t('validation.minValue', { value: '0' }),
      },
      max: {
        value: 3000,
        message: t('validation.maxValue', { value: '3000' }),
      },
    }),
    [t],
  );

  const getErrorMessageIfMissingFields = useCallback(
    (fields: Array<string>) => {
      const missingFields = fields
        .filter((f) => {
          if (_.has(getValues(f as keyof IProjectBasicsForm), 'value')) {
            return !(getValues(f as keyof IProjectBasicsForm) as IOption).value;
          } else {
            return !getValues(f as keyof IProjectBasicsForm);
          }
        })
        .map((f) => t(`validation.${f}`))
        .join(', ');

      return missingFields.length > 0 ? `Täytä kentät: ${missingFields}` : true;
    },
    [getValues, t],
  );

  const validatePhase = useCallback(() => {
    return {
      required: t('validation.required', { field: 'Vaihe' }) ?? '',
      validate: {
        isPhaseValid: (phase: IOption) => {
          const phaseToSubmit = phase.value;
          switch (phaseToSubmit) {
            case programmedPhase:
              return getErrorMessageIfMissingFields(['planningStartYear', 'constructionEndYear']);
            case draftInitiationPhase:
            case draftApprovalPhase:
            case constructionPlanPhase:
            case constructionWaitPhase:
              return getErrorMessageIfMissingFields([
                'estPlanningStart',
                'estPlanningEnd',
                'planningStartYear',
                'constructionEndYear',
              ]);
            case constructionPhase:
            case warrantyPeriodPhase:
            case completedPhase:
              if (
                (phase.value === warrantyPeriodPhase || phase.value === completedPhase) &&
                isBefore(getToday(), getValues('estConstructionEnd'))
              ) {
                return "Hankkeen vaihe ei voi olla 'Takuuaika' jos nykyinen päivä on ennen rakentamisen päättymispäivää";
              }
              return getErrorMessageIfMissingFields([
                'estPlanningStart',
                'estPlanningEnd',
                'planningStartYear',
                'constructionEndYear',
                'estConstructionStart',
                'estConstructionEnd',
                'personConstruction',
                'constructionPhaseDetail',
              ]);
            default:
              return true;
          }
        },
      },
    };
  }, [
    completedPhase,
    constructionPhase,
    constructionPlanPhase,
    constructionWaitPhase,
    draftApprovalPhase,
    draftInitiationPhase,
    getErrorMessageIfMissingFields,
    getValues,
    programmedPhase,
    t,
    warrantyPeriodPhase,
  ]);

  const validateProgrammed = useCallback(() => {
    return {
      validate: {
        isProgrammedValid: (programmed: boolean) => {
          const phase = getValues('phase');
          if (phase.value === proposalPhase || phase.value === designPhase) {
            return programmed
              ? `Ohjelmoitu oltava 'Kyllä' kun hankkeen vaihe on '${phase.label}'`
              : true;
          } else {
            return programmed
              ? true
              : `Ohjelmoitu on oltava 'Ei' kun hankkeen vaihe on '${phase.label}'`;
          }
        },
      },
    };
  }, [designPhase, getValues, proposalPhase]);

  const validatePlanningStartYear = useCallback(() => {
    return {
      ...numberMax3000,
      validate: {
        isBeforeEndDate: (startYear: string | null) => {
          const endYear = getValues('constructionEndYear');
          if (isFieldDirty('planningStartYear')) {
            if (startYear && endYear && parseInt(startYear) > parseInt(endYear)) {
              return t('validation.isBefore', {
                start: t('validation.planningStartYear'),
                end: t('validation.constructionEndYear'),
              });
            }
          }
          return true;
        },
      },
    };
  }, [numberMax3000, getValues, isFieldDirty, t]);

  const validateConstructionEndYear = useCallback(() => {
    return {
      ...numberMax3000,
      validate: {
        isAfterStartDate: (endYear: string | null) => {
          const startYear = getValues('planningStartYear');
          if (
            endYear &&
            startYear &&
            parseInt(endYear) < parseInt(startYear) &&
            isFieldDirty('constructionEndYear')
          ) {
            return t('validation.isAfter', {
              end: t('validation.constructionEndYear'),
              start: t('validation.planningStartYear'),
            });
          } else {
            return true;
          }
        },
      },
    };
  }, [getValues, isFieldDirty, numberMax3000, t]);

  return (
    <div className="w-full" id="basics-status-section">
      <FormSectionTitle {...getFieldProps('status')} />
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField {...getFieldProps('phase')} rules={validatePhase()} options={phases} />
        </div>
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('constructionPhaseDetail')}
            options={constructionPhaseDetails}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <div
            className="w-full border-l-8 border-error bg-error-light px-4 py-4"
            id="error-summary"
          >
            <label className="text-l font-bold">
              <IconAlertCircleFill color="#b01038" /> Seuraavat kentät ovat pakollisia
            </label>
          </div>
        </div>
      </div>
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
          <SelectField {...getFieldProps('category')} options={categories} />
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
