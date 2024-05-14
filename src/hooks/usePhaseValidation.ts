// hooks/usePhaseValidation.ts
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFieldsIfEmpty } from '@/utils/validation';
import { getToday, isBefore } from '@/utils/dates';
import { useOptions } from './useOptions';
import { UseFormGetValues } from 'react-hook-form';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { IOption } from '@/interfaces/common';

type UsePhaseValidationReturn = {
  validatePhase: {
    required: string;
    validate: {
      isPhaseValid: (phase: IOption) => string | boolean;
    };
  };
  phaseRequirements: string[];
  setPhaseRequirements: React.Dispatch<React.SetStateAction<string[]>>;
};

export const usePhaseValidation = ({
  getValues,
}: {
  getValues: UseFormGetValues<IProjectForm>;
}): UsePhaseValidationReturn => {
  const phases = useOptions('phases');
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
          if (phase.value === proposalPhase || (phase.value === designPhase && programmed)) {
            fields.push('programmed');
          } else if (!programmed) {
            fields.push('programmed');
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

  return { validatePhase, phaseRequirements, setPhaseRequirements };
};
