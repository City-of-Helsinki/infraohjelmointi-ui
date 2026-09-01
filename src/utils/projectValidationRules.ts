import { IListItem, IOption } from '@/interfaces/common';
import { TFunction } from 'i18next';
import { createDateToStartOfYear, getToday, isBefore, isSameOrBefore } from './dates';

export type ProjectValidationField =
  | 'phase'
  | 'phaseDetail'
  | 'programmed'
  | 'planningStartYear'
  | 'constructionEndYear'
  | 'estPlanningStart'
  | 'estPlanningEnd'
  | 'presenceStart'
  | 'presenceEnd'
  | 'visibilityStart'
  | 'visibilityEnd'
  | 'estConstructionStart'
  | 'estConstructionEnd'
  | 'estWarrantyPhaseStart'
  | 'estWarrantyPhaseEnd'
  | 'personPlanning'
  | 'personConstruction'
  | 'category'
  | 'priority'
  | 'masterClass'
  | 'class'
  | 'address';

type ProjectValidationIssueParams = {
  field?: ProjectValidationField;
  value?: ProjectValidationField;
  phaseLabel?: string;
};

export interface ProjectValidationIssue {
  field: ProjectValidationField;
  rule: string;
  messageKey: string;
  messageParams?: ProjectValidationIssueParams;
  visibleInDialog: boolean;
}

export interface ProjectValidationState {
  phaseId: string;
  phaseDetailId?: string | null;
  programmed?: boolean | null;
  planningStartYear?: string | number | null;
  constructionEndYear?: string | number | null;
  estPlanningStart?: string | null;
  estPlanningEnd?: string | null;
  presenceStart?: string | null;
  presenceEnd?: string | null;
  visibilityStart?: string | null;
  visibilityEnd?: string | null;
  estConstructionStart?: string | null;
  estConstructionEnd?: string | null;
  estWarrantyPhaseStart?: string | null;
  estWarrantyPhaseEnd?: string | null;
  personPlanningId?: string | null;
  personConstructionId?: string | null;
  categoryId?: string | null;
  priorityId?: string | null;
  masterClassId?: string | null;
  classId?: string | null;
  address?: string | null;
  projectMode?: 'new' | 'edit';
}

type ProjectPhaseOption = Pick<IOption, 'label' | 'value'>;

export interface ProjectPhaseResolver {
  proposalPhase: string;
  designPhase: string;
  programmedPhase: string;
  planningPhase: string;
  constructionWaitPhase: string;
  constructionPreparationPhase: string;
  constructionPhase: string;
  warrantyPeriodPhase: string;
  completedPhase: string;
  phasesThatNeedPlanning: string[];
  phasesThatNeedConstruction: string[];
  phasesThatNeedYearBounds: string[];
  phasesThatNeedResponsiblePerson: string[];
  phasesThatNeedConstructionPerson: string[];
  hasPhaseDetailsForPhase: (phaseId: string) => boolean;
  getPhaseLabelById: (phaseId: string) => string;
}

const toUniqueArray = <T>(values: T[]) => Array.from(new Set(values.filter(Boolean)));

const hasValue = (value: string | number | boolean | null | undefined) => {
  if (typeof value === 'boolean') {
    return true;
  }

  return String(value ?? '').trim() !== '';
};

const parseYear = (value: string | number | null | undefined) => {
  if (!hasValue(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const createProjectPhaseResolver = (
  phases: ProjectPhaseOption[],
  phaseDetails: IListItem[] = [],
): ProjectPhaseResolver => {
  const findPhaseId = (label: string) => phases.find((phase) => phase.label === label)?.value ?? '';

  const proposalPhase = findPhaseId('proposal');
  const designPhase = findPhaseId('design');
  const programmedPhase = findPhaseId('programming');
  const planningPhase = findPhaseId('designPlanning');
  const constructionWaitPhase = findPhaseId('constructionWait');
  const constructionPreparationPhase = findPhaseId('constructionPreparation');
  const constructionPhase = findPhaseId('construction');
  const warrantyPeriodPhase = findPhaseId('warrantyPeriod');
  const completedPhase = findPhaseId('completed');

  return {
    proposalPhase,
    designPhase,
    programmedPhase,
    planningPhase,
    constructionWaitPhase,
    constructionPreparationPhase,
    constructionPhase,
    warrantyPeriodPhase,
    completedPhase,
    phasesThatNeedPlanning: toUniqueArray([
      planningPhase,
      constructionWaitPhase,
      constructionPreparationPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ]),
    phasesThatNeedConstruction: toUniqueArray([
      constructionPreparationPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ]),
    phasesThatNeedYearBounds: toUniqueArray([
      programmedPhase,
      planningPhase,
      constructionWaitPhase,
      constructionPreparationPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ]),
    phasesThatNeedResponsiblePerson: toUniqueArray([
      planningPhase,
      constructionWaitPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ]),
    phasesThatNeedConstructionPerson: toUniqueArray([
      constructionPreparationPhase,
      constructionPhase,
      warrantyPeriodPhase,
      completedPhase,
    ]),
    hasPhaseDetailsForPhase: (phaseId: string) =>
      phaseDetails.some((detail) => detail.projectPhase?.id === phaseId),
    getPhaseLabelById: (phaseId: string) =>
      phases.find((phase) => phase.value === phaseId)?.label ?? '',
  };
};

export const getProjectPhaseRequiredFields = ({
  phaseId,
  projectMode = 'edit',
  phaseResolver,
}: {
  phaseId: string;
  projectMode?: 'new' | 'edit';
  phaseResolver: ProjectPhaseResolver;
}): ProjectValidationField[] => {
  const programmedRequirements: ProjectValidationField[] = [
    'planningStartYear',
    'constructionEndYear',
    'estPlanningStart',
    'estConstructionEnd',
    'category',
    'masterClass',
    'class',
  ];

  if (projectMode === 'new') {
    programmedRequirements.push('address');
  }

  const planningRequirements: ProjectValidationField[] = [
    'estPlanningEnd',
    'estPlanningStart',
    'personPlanning',
  ];
  const constructionRequirements: ProjectValidationField[] = [
    'estConstructionStart',
    'estConstructionEnd',
    'personConstruction',
  ];
  const phaseNeedsDetails = phaseResolver.hasPhaseDetailsForPhase(phaseId);
  const phaseDetailRequirement: ProjectValidationField[] = phaseNeedsDetails ? ['phaseDetail'] : [];

  switch (phaseId) {
    case phaseResolver.programmedPhase:
      return toUniqueArray<ProjectValidationField>([
        ...programmedRequirements,
        ...phaseDetailRequirement,
      ]);
    case phaseResolver.planningPhase:
    case phaseResolver.constructionWaitPhase:
      return toUniqueArray<ProjectValidationField>([
        ...programmedRequirements,
        ...planningRequirements,
        ...phaseDetailRequirement,
      ]);
    case phaseResolver.constructionPreparationPhase:
    case phaseResolver.constructionPhase:
    case phaseResolver.warrantyPeriodPhase:
    case phaseResolver.completedPhase:
      return toUniqueArray<ProjectValidationField>([
        ...programmedRequirements,
        ...planningRequirements,
        ...constructionRequirements,
        ...phaseDetailRequirement,
      ]);
    default:
      return toUniqueArray<ProjectValidationField>([...phaseDetailRequirement]);
  }
};

const createIssue = (
  visibleFields: Set<ProjectValidationField>,
  field: ProjectValidationField,
  rule: string,
  messageKey: string,
  messageParams?: ProjectValidationIssueParams,
): ProjectValidationIssue => ({
  field,
  rule,
  messageKey,
  messageParams,
  visibleInDialog: visibleFields.has(field),
});

type ProjectValidationIssueAdder = (
  field: ProjectValidationField,
  rule: string,
  messageKey: string,
  messageParams?: ProjectValidationIssueParams,
) => void;

const getProjectValidationFieldValues = (
  project: ProjectValidationState,
): Record<ProjectValidationField, string | number | boolean | null | undefined> => ({
  phase: project.phaseId,
  phaseDetail: project.phaseDetailId,
  programmed: project.programmed,
  planningStartYear: project.planningStartYear,
  constructionEndYear: project.constructionEndYear,
  estPlanningStart: project.estPlanningStart,
  estPlanningEnd: project.estPlanningEnd,
  presenceStart: project.presenceStart,
  presenceEnd: project.presenceEnd,
  visibilityStart: project.visibilityStart,
  visibilityEnd: project.visibilityEnd,
  estConstructionStart: project.estConstructionStart,
  estConstructionEnd: project.estConstructionEnd,
  estWarrantyPhaseStart: project.estWarrantyPhaseStart,
  estWarrantyPhaseEnd: project.estWarrantyPhaseEnd,
  personPlanning: project.personPlanningId,
  personConstruction: project.personConstructionId,
  category: project.categoryId,
  priority: project.priorityId,
  masterClass: project.masterClassId,
  class: project.classId,
  address: project.address,
});

const validateRequiredFields = (
  project: ProjectValidationState,
  phaseResolver: ProjectPhaseResolver,
  addIssue: ProjectValidationIssueAdder,
) => {
  const valuesByField = getProjectValidationFieldValues(project);
  const requiredFields = getProjectPhaseRequiredFields({
    phaseId: project.phaseId,
    projectMode: project.projectMode,
    phaseResolver,
  });

  for (const field of requiredFields) {
    if (!hasValue(valuesByField[field])) {
      addIssue(field, `${field}-required`, 'validation.required', { field });
    }
  }

  for (const field of ['category', 'priority'] as const) {
    if (!hasValue(valuesByField[field])) {
      addIssue(field, `${field}-required`, 'validation.required', { field });
    }
  }
};

const validateProgrammedState = (
  project: ProjectValidationState,
  phaseResolver: ProjectPhaseResolver,
  addIssue: ProjectValidationIssueAdder,
) => {
  if (project.phaseDetailId === 'suspended') {
    return;
  }

  if ([phaseResolver.proposalPhase, phaseResolver.designPhase, ''].includes(project.phaseId)) {
    if (project.programmed) {
      addIssue('programmed', 'programmed-must-be-false', 'validation.requiredFalse', {
        field: 'programmed',
      });
    }
    return;
  }

  if (project.programmed !== true) {
    addIssue('programmed', 'programmed-must-be-true', 'validation.requiredTrue', {
      field: 'programmed',
    });
  }
};

const validateYearBounds = (
  planningStartYear: number | null,
  constructionEndYear: number | null,
  addIssue: ProjectValidationIssueAdder,
) => {
  if (
    planningStartYear !== null &&
    constructionEndYear !== null &&
    planningStartYear > constructionEndYear
  ) {
    addIssue(
      'planningStartYear',
      'planning-start-year-before-construction-end-year',
      'validation.isBefore',
      { value: 'constructionEndYear' },
    );
  }

  if (
    planningStartYear !== null &&
    constructionEndYear !== null &&
    constructionEndYear < planningStartYear
  ) {
    addIssue(
      'constructionEndYear',
      'construction-end-year-after-planning-start-year',
      'validation.isAfter',
      { value: 'planningStartYear' },
    );
  }
};

const validateYearMatchesDate = (
  year: number | null,
  date: string | null | undefined,
  field: 'planningStartYear' | 'constructionEndYear',
  rule: string,
  messageKey: string,
  addIssue: ProjectValidationIssueAdder,
) => {
  const yearFromDate = date?.split('.').at(2);
  if (hasValue(year) && yearFromDate && yearFromDate !== String(year)) {
    addIssue(field, rule, messageKey);
  }
};

const validateScheduleDateOrder = (
  project: ProjectValidationState,
  addIssue: ProjectValidationIssueAdder,
) => {
  if (!isBefore(project.estPlanningStart, project.estPlanningEnd)) {
    addIssue('estPlanningStart', 'planning-start-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.estPlanningStart, project.presenceStart)) {
    addIssue('presenceStart', 'presence-start-after-planning-start', 'validation.isAfter', {
      value: 'estPlanningStart',
    });
  }

  if (!isBefore(project.presenceStart, project.presenceEnd)) {
    addIssue('presenceStart', 'presence-start-before-presence-end', 'validation.isBefore', {
      value: 'presenceEnd',
    });
    addIssue('presenceEnd', 'presence-end-after-presence-start', 'validation.isAfter', {
      value: 'presenceStart',
    });
  }

  if (!isBefore(project.presenceStart, project.estPlanningEnd)) {
    addIssue('presenceStart', 'presence-start-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.presenceEnd, project.estPlanningEnd)) {
    addIssue('presenceEnd', 'presence-end-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.estPlanningStart, project.visibilityStart)) {
    addIssue('visibilityStart', 'visibility-start-after-planning-start', 'validation.isAfter', {
      value: 'estPlanningStart',
    });
  }

  if (!isBefore(project.visibilityStart, project.visibilityEnd)) {
    addIssue('visibilityStart', 'visibility-start-before-visibility-end', 'validation.isBefore', {
      value: 'visibilityEnd',
    });
    addIssue('visibilityEnd', 'visibility-end-after-visibility-start', 'validation.isAfter', {
      value: 'visibilityStart',
    });
  }

  if (!isBefore(project.visibilityEnd, project.estPlanningEnd)) {
    addIssue('visibilityEnd', 'visibility-end-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.estPlanningEnd, project.estConstructionStart)) {
    addIssue(
      'estConstructionStart',
      'construction-start-after-planning-end',
      'validation.isAfter',
      { value: 'estPlanningEnd' },
    );
  }

  if (!isBefore(project.estConstructionStart, project.estConstructionEnd)) {
    addIssue(
      'estConstructionStart',
      'construction-start-before-construction-end',
      'validation.isBefore',
      { value: 'estConstructionEnd' },
    );
    addIssue(
      'estConstructionEnd',
      'construction-end-after-construction-start',
      'validation.isAfter',
      { value: 'estConstructionStart' },
    );
  }
};

const validateWarrantyDates = (
  project: ProjectValidationState,
  constructionEndYear: number | null,
  phaseResolver: ProjectPhaseResolver,
  addIssue: ProjectValidationIssueAdder,
) => {
  if (
    project.estConstructionEnd &&
    project.estWarrantyPhaseStart &&
    isBefore(project.estWarrantyPhaseStart, project.estConstructionEnd)
  ) {
    addIssue(
      'estConstructionEnd',
      'construction-end-before-warranty-start',
      'validation.isBefore',
      { value: 'estWarrantyPhaseStart' },
    );
  }

  const constructionEndYearStartDate =
    constructionEndYear === null ? null : createDateToStartOfYear(constructionEndYear);
  if (
    project.estWarrantyPhaseStart &&
    constructionEndYearStartDate &&
    isBefore(project.estWarrantyPhaseStart, constructionEndYearStartDate)
  ) {
    addIssue(
      'estWarrantyPhaseStart',
      'warranty-start-after-construction-end-year',
      'validation.isSameOrAfter',
      { value: 'constructionEndYear' },
    );
  }

  if (!isSameOrBefore(project.estConstructionEnd, project.estWarrantyPhaseStart)) {
    addIssue(
      'estWarrantyPhaseStart',
      'warranty-start-same-or-after-construction-end',
      'validation.isSameOrAfter',
      { value: 'estConstructionEnd' },
    );
  }

  if (!isBefore(project.estWarrantyPhaseStart, project.estWarrantyPhaseEnd)) {
    addIssue('estWarrantyPhaseStart', 'warranty-start-before-warranty-end', 'validation.isBefore', {
      value: 'estWarrantyPhaseEnd',
    });
    addIssue('estWarrantyPhaseEnd', 'warranty-end-after-warranty-start', 'validation.isAfter', {
      value: 'estWarrantyPhaseStart',
    });
  }

  if (
    project.phaseId === phaseResolver.warrantyPeriodPhase &&
    !hasValue(project.estWarrantyPhaseEnd)
  ) {
    addIssue('estWarrantyPhaseEnd', 'warranty-end-required', 'validation.required', {
      field: 'estWarrantyPhaseEnd',
    });
  }

  if (
    project.estWarrantyPhaseEnd &&
    constructionEndYearStartDate &&
    isBefore(project.estWarrantyPhaseEnd, constructionEndYearStartDate)
  ) {
    addIssue(
      'estWarrantyPhaseEnd',
      'warranty-end-after-construction-end-year',
      'validation.isSameOrAfter',
      { value: 'constructionEndYear' },
    );
  }
};

const validatePhaseTiming = (
  project: ProjectValidationState,
  phaseResolver: ProjectPhaseResolver,
  today: string,
  addIssue: ProjectValidationIssueAdder,
) => {
  if (
    project.phaseId === phaseResolver.warrantyPeriodPhase &&
    isBefore(today, project.estConstructionEnd)
  ) {
    addIssue('phase', 'warranty-phase-too-early', 'validation.phaseTooEarly', {
      phaseLabel: phaseResolver.getPhaseLabelById(project.phaseId),
    });
  }

  if (project.phaseId !== phaseResolver.completedPhase) {
    return;
  }

  if (isBefore(today, project.estConstructionEnd)) {
    addIssue('phase', 'completed-phase-before-construction-end', 'validation.phaseTooEarly', {
      phaseLabel: phaseResolver.getPhaseLabelById(project.phaseId),
    });
  }

  if (project.estWarrantyPhaseEnd && isBefore(today, project.estWarrantyPhaseEnd)) {
    addIssue('phase', 'completed-phase-before-warranty-end', 'validation.completedPhaseTooEarly');
  }
};

export const validateProjectState = ({
  project,
  phaseResolver,
  visibleFields,
  today = getToday(),
}: {
  project: ProjectValidationState;
  phaseResolver: ProjectPhaseResolver;
  visibleFields: ProjectValidationField[];
  today?: string;
}): ProjectValidationIssue[] => {
  const issues: ProjectValidationIssue[] = [];
  const visibleFieldSet = new Set(visibleFields);
  const planningStartYear = parseYear(project.planningStartYear);
  const constructionEndYear = parseYear(project.constructionEndYear);

  const addIssue: ProjectValidationIssueAdder = (
    field: ProjectValidationField,
    rule: string,
    messageKey: string,
    messageParams?: ProjectValidationIssueParams,
  ) => {
    if (issues.some((issue) => issue.field === field && issue.rule === rule)) {
      return;
    }

    issues.push(createIssue(visibleFieldSet, field, rule, messageKey, messageParams));
  };

  if (!hasValue(project.phaseId)) {
    addIssue('phase', 'phase-required', 'validation.required', { field: 'phase' });
    return issues;
  }

  validateRequiredFields(project, phaseResolver, addIssue);
  validateProgrammedState(project, phaseResolver, addIssue);
  validateYearBounds(planningStartYear, constructionEndYear, addIssue);
  validateYearMatchesDate(
    planningStartYear,
    project.estPlanningStart,
    'planningStartYear',
    'planning-start-year-must-match-planning-start-date',
    'validation.planningStartYearChangingValidator',
    addIssue,
  );
  validateYearMatchesDate(
    constructionEndYear,
    project.estConstructionEnd,
    'constructionEndYear',
    'construction-end-year-must-match-construction-end-date',
    'validation.constructionEndYearValidator',
    addIssue,
  );
  validateScheduleDateOrder(project, addIssue);
  validateWarrantyDates(project, constructionEndYear, phaseResolver, addIssue);
  validatePhaseTiming(project, phaseResolver, today, addIssue);

  return issues;
};

const getIssueIdentity = (issue: Pick<ProjectValidationIssue, 'field' | 'rule'>) =>
  `${issue.field}:${issue.rule}`;

export const getNewProjectValidationIssues = ({
  originalProject,
  nextProject,
  phaseResolver,
  visibleFields,
  today,
}: {
  originalProject: ProjectValidationState;
  nextProject: ProjectValidationState;
  phaseResolver: ProjectPhaseResolver;
  visibleFields: ProjectValidationField[];
  today?: string;
}) => {
  const originalIssues = validateProjectState({
    project: originalProject,
    phaseResolver,
    visibleFields,
    today,
  });
  const nextIssues = validateProjectState({
    project: nextProject,
    phaseResolver,
    visibleFields,
    today,
  });
  const originalIssueIds = new Set(originalIssues.map(getIssueIdentity));

  return nextIssues.filter((issue) => !originalIssueIds.has(getIssueIdentity(issue)));
};

export const translateProjectValidationIssue = (
  issue: ProjectValidationIssue,
  t: TFunction<'translation'>,
) => {
  switch (issue.messageKey) {
    case 'validation.required':
    case 'validation.requiredTrue':
    case 'validation.requiredFalse':
      return t(issue.messageKey, {
        field: issue.messageParams?.field
          ? translateProjectValidationField(issue.messageParams.field, t)
          : '',
      });
    case 'validation.isBefore':
    case 'validation.isAfter':
    case 'validation.isSameOrAfter':
      return t(issue.messageKey, {
        value: issue.messageParams?.value
          ? translateProjectValidationField(issue.messageParams.value, t)
          : '',
      });
    case 'validation.phaseTooEarly':
      return t(issue.messageKey, { value: issue.messageParams?.phaseLabel ?? '' });
    default:
      return t(issue.messageKey);
  }
};

export const translateProjectValidationField = (
  field: ProjectValidationField,
  t: TFunction<'translation'>,
) => {
  const fieldKey = `validation.${field}`;
  const translated = t(fieldKey);

  if (translated !== fieldKey) {
    return translated;
  }

  const fallbackKeys = [`projectForm.${field}`, `myWorkloadView.table.${field}`];
  for (const fallbackKey of fallbackKeys) {
    const fallbackTranslation = t(fallbackKey);
    if (fallbackTranslation !== fallbackKey) {
      return fallbackTranslation;
    }
  }

  return field;
};
