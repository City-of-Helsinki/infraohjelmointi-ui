import { useMemo } from 'react';
import { IProject } from '@/interfaces/projectInterfaces';
import { useOptions } from './useOptions';
import { IOption } from '@/interfaces/common';
import { getToday, isBefore } from '@/utils/dates';
import { useAppSelector } from './common';
import { RootState } from '@/store';

interface IUseProjectPhaseValidationProps {
  getProject: () => IProject;
}

const fieldsIfEmpty = (fields: Array<string>, obj: IProject) => {
  const emptyFields = fields.filter((field) => {
    const val = obj[field as keyof IProject];
    if (val === undefined || val === null || val === '') return true;
    if (typeof val === 'object' && val !== null && 'value' in val) {
      return !(val as { value: string }).value;
    }
    return false;
  });
  return emptyFields;
};

export const useProjectPhaseValidation = ({
  getProject,
}: IUseProjectPhaseValidationProps): ((phase: IOption) => boolean) => {
  const project = getProject();

  const phases = useOptions('phases');
  const allPhaseDetails = useAppSelector((state: RootState) => state.lists.projectPhaseDetails);

  const phaseValues = useMemo(() => phases.map(({ value }) => value), [phases]);
  const findPhase = (val: string) => phaseValues.find((v) => v === val);
  const proposalPhase = findPhase('proposal');
  const designPhase = findPhase('design');
  const programmedPhase = findPhase('programming');
  const draftInitiationPhase = findPhase('draftInitiation');
  const draftApprovalPhase = findPhase('draftApproval');
  const constructionPlanPhase = findPhase('constructionPlan');
  const constructionWaitPhase = findPhase('constructionWait');
  const constructionPreparationPhase = findPhase('constructionPreparation');
  const constructionPhase = findPhase('construction');
  const warrantyPeriodPhase = findPhase('warrantyPeriod');
  const completedPhase = findPhase('completed');
  const suspendedPhase = findPhase('suspended');

  return useMemo(
    () =>
      (phase: IOption): boolean => {
        if (phase.value === '') {
          return false;
        }

        const phaseToSubmit = phase.value;
        const programmed = project.programmed;
        const hasDetailsForPhase = allPhaseDetails.some(
          (d) => d.projectPhase?.id === phaseToSubmit,
        );

        const programmedRequirements = [
          'planningStartYear',
          'constructionEndYear',
          'estPlanningStart',
          'estConstructionEnd',
          'category',
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

        let fields: Array<string> = [];
        switch (phaseToSubmit) {
          case programmedPhase:
            fields = fieldsIfEmpty([...programmedRequirements], project);
            if (hasDetailsForPhase) fields.push(...fieldsIfEmpty(['phaseDetail'], project));
            break;
          case draftInitiationPhase:
          case draftApprovalPhase:
          case constructionPlanPhase:
          case constructionWaitPhase:
            fields = fieldsIfEmpty([...programmedRequirements, ...planningRequirements], project);
            if (hasDetailsForPhase) fields.push(...fieldsIfEmpty(['phaseDetail'], project));
            break;
          case constructionPreparationPhase:
          case constructionPhase:
            fields = fieldsIfEmpty([...combinedRequirements, 'phaseDetail'], project);
            break;
          case warrantyPeriodPhase:
          case completedPhase:
            if (isBefore(getToday(), project.estConstructionEnd)) {
              return false;
            }
            fields = fieldsIfEmpty([...combinedRequirements], project);
            break;
          case suspendedPhase:
            break;
        }

        const isProposalOrDesign =
          phase.value === proposalPhase || phase.value === designPhase;
        const isSuspended = phase.value === suspendedPhase;

        if (!isSuspended) {
          if ((isProposalOrDesign && programmed) || (!isProposalOrDesign && !programmed)) {
            fields.push('programmed');
          }
        }

        return fields.length === 0;
      },
    [
      project,
      phaseValues,
      allPhaseDetails,
      proposalPhase,
      designPhase,
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
    ],
  );
};
