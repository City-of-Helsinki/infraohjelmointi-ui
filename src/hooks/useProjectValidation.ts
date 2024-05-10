import { useMemo } from 'react';
import { getToday, isBefore } from '@/utils/dates';
import { useOptions } from './useOptions';
import { IOption } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';

interface IUseProjectPhaseValidationProps {
  getProject: () => IProject;
}

export const useProjectPhaseValidation = ({
  getProject,
}: IUseProjectPhaseValidationProps): ((phase: IOption) => boolean) => {
  const project = getProject();

  const phases = useOptions('phases');

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

  return useMemo(
    () =>
      (phase: IOption): boolean => {
        if (phase.value === '') {
          return false;
        }

        const phaseToSubmit = phase.value;
        const programmed = project.programmed;
        const fieldsIfEmpty = (fields: Array<string>, obj: IProject) => {
          const emptyFields = fields.filter(
            (field) =>
              obj[field as keyof IProject] === undefined ||
              obj[field as keyof IProject] === null ||
              obj[field as keyof IProject] === '',
          );
          return emptyFields;
        };

        const programmedRequirements = ['planningStartYear', 'constructionEndYear', 'category'];
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

        let fields: Array<string> = [];

        switch (phaseToSubmit) {
          case programmedPhase:
            fields = fieldsIfEmpty([...programmedRequirements], project);
            break;
          case draftInitiationPhase:
          case draftApprovalPhase:
          case constructionPlanPhase:
          case constructionWaitPhase:
            fields = fieldsIfEmpty([...programmedRequirements, ...planningRequirements], project);
            break;
          case constructionPhase:
            fields = fieldsIfEmpty([...combinedRequirements, 'constructionPhaseDetail'], project);
            break;
          case warrantyPeriodPhase:
          case completedPhase:
            if (isBefore(getToday(), project.estConstructionEnd)) {
              return false;
            }
            fields = fieldsIfEmpty([...combinedRequirements], project);
            break;
        }

        if (phase.value === proposalPhase || phase.value === designPhase) {
          if (programmed) {
            fields.push('programmed');
          }
        } else {
          if (!programmed) {
            fields.push('programmed');
          }
        }

        return fields.length === 0;
      },
    [
      project,
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
};
