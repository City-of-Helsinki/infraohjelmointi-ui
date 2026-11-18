import { IMyWorkloadEditFormValues } from '@/interfaces/myWorkloadInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { normalizeMyWorkloadDate } from './myWorkloadUtils';
import { ProjectValidationField, ProjectValidationState } from './projectValidationRules';

export const planningVisibleValidationFields: ProjectValidationField[] = [
  'phase',
  'phaseDetail',
  'estPlanningStart',
  'estPlanningEnd',
  'presenceStart',
  'presenceEnd',
  'visibilityStart',
  'visibilityEnd',
];

export const constructionVisibleValidationFields: ProjectValidationField[] = [
  'phase',
  'phaseDetail',
  'estConstructionStart',
  'estConstructionEnd',
];

export const validationFieldToFormFieldMap: Partial<
  Record<ProjectValidationField, keyof IMyWorkloadEditFormValues>
> = {
  phase: 'phaseId',
  phaseDetail: 'phaseDetailId',
  estPlanningStart: 'planningStart',
  estPlanningEnd: 'planningEnd',
  presenceStart: 'presenceStart',
  presenceEnd: 'presenceEnd',
  visibilityStart: 'visibilityStart',
  visibilityEnd: 'visibilityEnd',
  estConstructionStart: 'constructionStart',
  estConstructionEnd: 'constructionEnd',
};

export const mapProjectToValidationState = (projectData: IProject): ProjectValidationState => ({
  phaseId: projectData.phase?.id ?? '',
  phaseDetailId: projectData.phaseDetail?.id ?? '',
  programmed: projectData.programmed,
  planningStartYear: projectData.planningStartYear,
  constructionEndYear: projectData.constructionEndYear,
  estPlanningStart: normalizeMyWorkloadDate(projectData.estPlanningStart),
  estPlanningEnd: normalizeMyWorkloadDate(projectData.estPlanningEnd),
  presenceStart: normalizeMyWorkloadDate(projectData.presenceStart),
  presenceEnd: normalizeMyWorkloadDate(projectData.presenceEnd),
  visibilityStart: normalizeMyWorkloadDate(projectData.visibilityStart),
  visibilityEnd: normalizeMyWorkloadDate(projectData.visibilityEnd),
  estConstructionStart: normalizeMyWorkloadDate(projectData.estConstructionStart),
  estConstructionEnd: normalizeMyWorkloadDate(projectData.estConstructionEnd),
  estWarrantyPhaseStart: normalizeMyWorkloadDate(projectData.estWarrantyPhaseStart),
  estWarrantyPhaseEnd: normalizeMyWorkloadDate(projectData.estWarrantyPhaseEnd),
  personPlanningId: projectData.personPlanning?.id ?? '',
  personConstructionId: projectData.personConstruction?.id ?? '',
  categoryId: projectData.category?.id ?? '',
  priorityId: projectData.priority?.id ?? '',
  masterClassId: projectData.projectClass ?? '',
  classId: projectData.projectClass ?? '',
  address: projectData.address ?? '',
  projectMode: 'edit',
});

export const mapDialogValuesToValidationState = (
  projectData: IProject,
  values: IMyWorkloadEditFormValues,
): ProjectValidationState => {
  const base = mapProjectToValidationState(projectData);
  const resolveDate = (value: string, fallback: string | null | undefined) => {
    const trimmed = value.trim();
    return trimmed ? normalizeMyWorkloadDate(trimmed) : (fallback ?? '');
  };

  return {
    ...base,
    phaseId: values.phaseId.trim(),
    phaseDetailId: values.phaseDetailId.trim(),
    estPlanningStart: resolveDate(values.planningStart, base.estPlanningStart),
    estPlanningEnd: resolveDate(values.planningEnd, base.estPlanningEnd),
    presenceStart: resolveDate(values.presenceStart, base.presenceStart),
    presenceEnd: resolveDate(values.presenceEnd, base.presenceEnd),
    visibilityStart: resolveDate(values.visibilityStart, base.visibilityStart),
    visibilityEnd: resolveDate(values.visibilityEnd, base.visibilityEnd),
    estConstructionStart: resolveDate(values.constructionStart, base.estConstructionStart),
    estConstructionEnd: resolveDate(values.constructionEnd, base.estConstructionEnd),
  };
};
