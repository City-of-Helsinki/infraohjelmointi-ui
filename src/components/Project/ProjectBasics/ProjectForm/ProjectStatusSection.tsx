import { FormSectionTitle, NumberField, SelectField } from '@/components/shared';
import { FC, memo, useMemo, useState, useEffect } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';
import { IListItem, IOption } from '@/interfaces/common';
import { getToday, isBefore, updateYear } from '@/utils/dates';
import RadioCheckboxField from '@/components/shared/RadioCheckboxField';
import ErrorSummary from './ErrorSummary';
import { getFieldsIfEmpty, validateMaxNumber } from '@/utils/validation';
import _ from 'lodash';
import { mapIconKey } from '@/utils/common';
import { useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import { selectProjectPhases } from '@/reducers/listsSlice';

interface IProjectStatusSectionProps {
  getValues: UseFormGetValues<IProjectForm>;
  getFieldProps: (name: string) => {
    name: string;
    label: string;
    control: Control<IProjectForm>;
  };
  isInputDisabled: boolean;
  isUserOnlyProjectManager: boolean;
}

const getPhaseIndexByPhaseId = (phaseId: string | undefined, phasesWithIndexes: IListItem[]) => {
  const phase = phasesWithIndexes.find(({id}) => id === phaseId);
  return phase?.index;
}

const ProjectStatusSection: FC<IProjectStatusSectionProps> = ({
  getFieldProps,
  getValues,
  isInputDisabled,
  isUserOnlyProjectManager
}) => {
  const phases = useOptions('phases');
  const phasesWithIndexes = useAppSelector(selectProjectPhases);
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

          if (isUserOnlyProjectManager) {
            const previousPhaseIndex = getPhaseIndexByPhaseId(currentPhase, phasesWithIndexes);
            const newPhaseIndex = getPhaseIndexByPhaseId(phase.value, phasesWithIndexes);
            if (newPhaseIndex !== undefined && previousPhaseIndex !== undefined && (newPhaseIndex < previousPhaseIndex)) {
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
            'category',
            'masterClass',
            'class',
          ];
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
              fields.push(...fieldsIfEmpty([...combinedRequirements, 'constructionPhaseDetail']));
              break;
            case warrantyPeriodPhase:
            case completedPhase:
              if (isBefore(getToday(), getValues('estConstructionEnd'))) {
                return t('validation.phaseTooEarly', { value: phase.label });
              }

              fields.push(...fieldsIfEmpty([...combinedRequirements]));
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
    [t, isUserOnlyProjectManager, getValues, proposalPhase, designPhase, getPhaseIndexByPhaseId, currentPhase, programmedPhase, draftInitiationPhase, draftApprovalPhase, constructionPlanPhase, constructionWaitPhase, constructionPhase, warrantyPeriodPhase, completedPhase],
  );

  const validateConstructionPhaseDetails = useMemo(
    () => ({
      validate: {
        isConstructionPhaseDetailsValid: (constructionPhaseDetail: IOption) => {
          const phase = getValues('phase');
          // Required after phase is changed to construction
          if (phase.value === constructionPhase && constructionPhaseDetail?.value === '') {
            return t('validation.required', { field: t('validation.constructionPhaseDetail') });
          }
          return true;
        },
      },
    }),
    [completedPhase, constructionPhase, getValues, t, warrantyPeriodPhase],
  );

  const isConstructionPhaseDetailsDisabled = useMemo(() => {
    return currentPhase !== constructionPhase;
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

  const projectFormPhase = getValues('phase').label;
  const projectPhase = useAppSelector(selectProject)?.phase;
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
        <RadioCheckboxField
          {...getFieldProps('programmed')}
          rules={validateProgrammed}
          disabled={isInputDisabled}
        />
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField
            {...getFieldProps('planningStartYear')}
            rules={validatePlanningStartYear}
            disabled={isInputDisabled}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-col-md">
          <NumberField
            {...getFieldProps('constructionEndYear')}
            rules={validateConstructionEndYear}
            disabled={isInputDisabled}
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
            disabled={isInputDisabled}
          />
        </div>
      </div>
      <div className="form-row">
        <RadioCheckboxField {...getFieldProps('effectHousing')} disabled={isInputDisabled} />
      </div>
      <div className="form-row">
        <div className="form-col-xl">
          <SelectField
            {...getFieldProps('riskAssessment')}
            options={riskAssessments}
            disabled={isInputDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectStatusSection);
