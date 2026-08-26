import { IListItem, IOption } from '@/interfaces/common';
import { TFunction } from 'i18next';
import { createDateToStartOfYear, getToday, isBefore, isSameOrBefore, updateYear } from './dates';

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
      return toUniqueArray<ProjectValidationField>([
        ...programmedRequirements,
        ...planningRequirements,
        ...constructionRequirements,
        ...phaseDetailRequirement,
      ]);
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
  const phaseId = project.phaseId;
  const planningStartYear = parseYear(project.planningStartYear);
  const constructionEndYear = parseYear(project.constructionEndYear);

  const pushIssue = (
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

  if (!hasValue(phaseId)) {
    pushIssue('phase', 'phase-required', 'validation.required', { field: 'phase' });
    return issues;
  }

  for (const field of getProjectPhaseRequiredFields({
    phaseId,
    projectMode: project.projectMode,
    phaseResolver,
  })) {
    const valueByField: Record<
      ProjectValidationField,
      string | number | boolean | null | undefined
    > = {
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
    };

    if (!hasValue(valueByField[field])) {
      pushIssue(field, `${field}-required`, 'validation.required', { field });
    }
  }

  if (!hasValue(project.categoryId)) {
    pushIssue('category', 'category-required', 'validation.required', { field: 'category' });
  }

  if (!hasValue(project.priorityId)) {
    pushIssue('priority', 'priority-required', 'validation.required', { field: 'priority' });
  }

  const isSuspended = project.phaseDetailId === 'suspended';
  if (!isSuspended) {
    if ([phaseResolver.proposalPhase, phaseResolver.designPhase, ''].includes(phaseId)) {
      if (project.programmed) {
        pushIssue('programmed', 'programmed-must-be-false', 'validation.requiredFalse', {
          field: 'programmed',
        });
      }
    } else if (project.programmed !== true) {
      pushIssue('programmed', 'programmed-must-be-true', 'validation.requiredTrue', {
        field: 'programmed',
      });
    }
  }

  if (
    planningStartYear !== null &&
    constructionEndYear !== null &&
    planningStartYear > constructionEndYear
  ) {
    pushIssue(
      'planningStartYear',
      'planning-start-year-before-construction-end-year',
      'validation.isBefore',
      {
        value: 'constructionEndYear',
      },
    );
  }

  if (
    planningStartYear !== null &&
    constructionEndYear !== null &&
    constructionEndYear < planningStartYear
  ) {
    pushIssue(
      'constructionEndYear',
      'construction-end-year-after-planning-start-year',
      'validation.isAfter',
      {
        value: 'planningStartYear',
      },
    );
  }

  if (project.estPlanningStart) {
    const planningStartYearFromDate = project.estPlanningStart.split('.').at(2);
    if (
      hasValue(planningStartYear) &&
      planningStartYearFromDate &&
      planningStartYearFromDate !== String(planningStartYear)
    ) {
      pushIssue(
        'planningStartYear',
        'planning-start-year-must-match-planning-start-date',
        'validation.planningStartYearChangingValidator',
      );
    }
  }

  if (project.estConstructionEnd) {
    const constructionEndYearFromDate = project.estConstructionEnd.split('.').at(2);
    if (
      hasValue(constructionEndYear) &&
      constructionEndYearFromDate &&
      constructionEndYearFromDate !== String(constructionEndYear)
    ) {
      pushIssue(
        'constructionEndYear',
        'construction-end-year-must-match-construction-end-date',
        'validation.constructionEndYearValidator',
      );
    }
  }

  if (!isBefore(project.estPlanningStart, project.estPlanningEnd)) {
    pushIssue('estPlanningStart', 'planning-start-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.estPlanningStart, project.presenceStart)) {
    pushIssue('presenceStart', 'presence-start-after-planning-start', 'validation.isAfter', {
      value: 'estPlanningStart',
    });
  }

  if (!isBefore(project.presenceStart, project.presenceEnd)) {
    pushIssue('presenceStart', 'presence-start-before-presence-end', 'validation.isBefore', {
      value: 'presenceEnd',
    });
  }

  if (!isBefore(project.presenceStart, project.estPlanningEnd)) {
    pushIssue('presenceStart', 'presence-start-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.presenceStart, project.presenceEnd)) {
    pushIssue('presenceEnd', 'presence-end-after-presence-start', 'validation.isAfter', {
      value: 'presenceStart',
    });
  }

  if (!isBefore(project.presenceEnd, project.estPlanningEnd)) {
    pushIssue('presenceEnd', 'presence-end-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.estPlanningStart, project.visibilityStart)) {
    pushIssue('visibilityStart', 'visibility-start-after-planning-start', 'validation.isAfter', {
      value: 'estPlanningStart',
    });
  }

  if (!isBefore(project.visibilityStart, project.visibilityEnd)) {
    pushIssue('visibilityStart', 'visibility-start-before-visibility-end', 'validation.isBefore', {
      value: 'visibilityEnd',
    });
  }

  if (!isBefore(project.visibilityStart, project.visibilityEnd)) {
    pushIssue('visibilityEnd', 'visibility-end-after-visibility-start', 'validation.isAfter', {
      value: 'visibilityStart',
    });
  }

  if (!isBefore(project.visibilityEnd, project.estPlanningEnd)) {
    pushIssue('visibilityEnd', 'visibility-end-before-planning-end', 'validation.isBefore', {
      value: 'estPlanningEnd',
    });
  }

  if (!isBefore(project.estPlanningEnd, project.estConstructionStart)) {
    pushIssue(
      'estConstructionStart',
      'construction-start-after-planning-end',
      'validation.isAfter',
      { value: 'estPlanningEnd' },
    );
  }

  if (!isBefore(project.estConstructionStart, project.estConstructionEnd)) {
    pushIssue(
      'estConstructionStart',
      'construction-start-before-construction-end',
      'validation.isBefore',
      { value: 'estConstructionEnd' },
    );
    pushIssue(
      'estConstructionEnd',
      'construction-end-after-construction-start',
      'validation.isAfter',
      { value: 'estConstructionStart' },
    );
  }

  if (
    project.estConstructionEnd &&
    project.estWarrantyPhaseStart &&
    isBefore(project.estWarrantyPhaseStart, project.estConstructionEnd)
  ) {
    pushIssue(
      'estConstructionEnd',
      'construction-end-before-warranty-start',
      'validation.isBefore',
      { value: 'estWarrantyPhaseStart' },
    );
  }

  if (project.estWarrantyPhaseStart && constructionEndYear !== null) {
    const constructionEndYearStartDate = createDateToStartOfYear(constructionEndYear);
    if (
      constructionEndYearStartDate &&
      isBefore(project.estWarrantyPhaseStart, constructionEndYearStartDate)
    ) {
      pushIssue(
        'estWarrantyPhaseStart',
        'warranty-start-after-construction-end-year',
        'validation.isSameOrAfter',
        { value: 'constructionEndYear' },
      );
    }
  }

  if (!isSameOrBefore(project.estConstructionEnd, project.estWarrantyPhaseStart)) {
    pushIssue(
      'estWarrantyPhaseStart',
      'warranty-start-same-or-after-construction-end',
      'validation.isSameOrAfter',
      { value: 'estConstructionEnd' },
    );
  }

  if (!isBefore(project.estWarrantyPhaseStart, project.estWarrantyPhaseEnd)) {
    pushIssue(
      'estWarrantyPhaseStart',
      'warranty-start-before-warranty-end',
      'validation.isBefore',
      {
        value: 'estWarrantyPhaseEnd',
      },
    );
    pushIssue('estWarrantyPhaseEnd', 'warranty-end-after-warranty-start', 'validation.isAfter', {
      value: 'estWarrantyPhaseStart',
    });
  }

  if (phaseId === phaseResolver.warrantyPeriodPhase && !hasValue(project.estWarrantyPhaseEnd)) {
    pushIssue('estWarrantyPhaseEnd', 'warranty-end-required', 'validation.required', {
      field: 'estWarrantyPhaseEnd',
    });
  }

  if (project.estWarrantyPhaseEnd && constructionEndYear !== null) {
    const constructionEndYearStartDate = createDateToStartOfYear(constructionEndYear);
    if (
      constructionEndYearStartDate &&
      isBefore(project.estWarrantyPhaseEnd, constructionEndYearStartDate)
    ) {
      pushIssue(
        'estWarrantyPhaseEnd',
        'warranty-end-after-construction-end-year',
        'validation.isSameOrAfter',
        { value: 'constructionEndYear' },
      );
    }
  }

  if (
    phaseId === phaseResolver.warrantyPeriodPhase &&
    isBefore(today, project.estConstructionEnd)
  ) {
    pushIssue('phase', 'warranty-phase-too-early', 'validation.phaseTooEarly', {
      phaseLabel: phaseResolver.getPhaseLabelById(phaseId),
    });
  }

  if (phaseId === phaseResolver.completedPhase) {
    if (isBefore(today, project.estConstructionEnd)) {
      pushIssue('phase', 'completed-phase-before-construction-end', 'validation.phaseTooEarly', {
        phaseLabel: phaseResolver.getPhaseLabelById(phaseId),
      });
    }

    if (project.estWarrantyPhaseEnd && isBefore(today, project.estWarrantyPhaseEnd)) {
      pushIssue(
        'phase',
        'completed-phase-before-warranty-end',
        'validation.completedPhaseTooEarly',
      );
    }
  }

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
