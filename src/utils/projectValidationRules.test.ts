import { mockProjectPhaseDetails, mockProjectPhases } from '@/mocks/mockLists';
import {
  createProjectPhaseResolver,
  getNewProjectValidationIssues,
  getProjectPhaseRequiredFields,
  validateProjectState,
} from './projectValidationRules';

const phaseResolver = createProjectPhaseResolver(
  mockProjectPhases.data.map((phase) => ({ value: phase.id, label: phase.value })),
  mockProjectPhaseDetails.data,
);

describe('projectValidationRules', () => {
  it('returns hidden phase requirements for construction preparation phase', () => {
    const fields = getProjectPhaseRequiredFields({
      phaseId: phaseResolver.constructionPreparationPhase,
      phaseResolver,
    });

    expect(fields).toEqual(
      expect.arrayContaining([
        'planningStartYear',
        'constructionEndYear',
        'estPlanningStart',
        'estPlanningEnd',
        'estConstructionStart',
        'estConstructionEnd',
        'personPlanning',
        'personConstruction',
        'masterClass',
        'class',
      ]),
    );
  });

  it('marks missing hidden fields as non-visible dialog issues', () => {
    const issues = validateProjectState({
      project: {
        phaseId: phaseResolver.warrantyPeriodPhase,
        programmed: true,
        planningStartYear: 2026,
        constructionEndYear: null,
        estPlanningStart: '01.01.2026',
        estPlanningEnd: '31.12.2026',
        estConstructionStart: '01.04.2027',
        estConstructionEnd: '31.10.2027',
        estWarrantyPhaseEnd: '31.12.2028',
        personPlanningId: 'planning-person',
        personConstructionId: 'construction-person',
        categoryId: 'category-id',
        priorityId: 'priority-id',
        masterClassId: 'class-id',
        classId: 'class-id',
      },
      phaseResolver,
      visibleFields: ['phase', 'estConstructionStart', 'estConstructionEnd'],
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'constructionEndYear',
          visibleInDialog: false,
          messageKey: 'validation.required',
        }),
      ]),
    );
  });

  it('marks visible date ordering issues as visible dialog issues', () => {
    const issues = validateProjectState({
      project: {
        phaseId: phaseResolver.planningPhase,
        programmed: true,
        planningStartYear: 2026,
        constructionEndYear: 2027,
        estPlanningStart: '31.12.2026',
        estPlanningEnd: '01.01.2026',
        presenceStart: '01.02.2026',
        presenceEnd: '30.11.2026',
        visibilityStart: '01.03.2026',
        visibilityEnd: '31.10.2026',
        personPlanningId: 'planning-person',
        categoryId: 'category-id',
        priorityId: 'priority-id',
        masterClassId: 'class-id',
        classId: 'class-id',
      },
      phaseResolver,
      visibleFields: [
        'phase',
        'estPlanningStart',
        'estPlanningEnd',
        'presenceStart',
        'presenceEnd',
        'visibilityStart',
        'visibilityEnd',
      ],
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'estPlanningStart',
          visibleInDialog: true,
          messageKey: 'validation.isBefore',
        }),
      ]),
    );
  });

  it('returns no issues for a valid construction dialog project state', () => {
    const issues = validateProjectState({
      project: {
        phaseId: phaseResolver.constructionPhase,
        phaseDetailId: '4f9f98f1-0bec-4cf4-b09f-208521d2b70d',
        programmed: true,
        planningStartYear: 2026,
        constructionEndYear: 2027,
        estPlanningStart: '01.01.2026',
        estPlanningEnd: '31.12.2026',
        presenceStart: '01.02.2026',
        presenceEnd: '30.11.2026',
        visibilityStart: '01.03.2026',
        visibilityEnd: '31.10.2026',
        estConstructionStart: '01.04.2027',
        estConstructionEnd: '31.10.2027',
        estWarrantyPhaseStart: '01.11.2027',
        estWarrantyPhaseEnd: '31.12.2028',
        personPlanningId: 'planning-person',
        personConstructionId: 'construction-person',
        categoryId: 'category-id',
        priorityId: 'priority-id',
        masterClassId: 'class-id',
        classId: 'class-id',
      },
      phaseResolver,
      visibleFields: ['phase', 'estConstructionStart', 'estConstructionEnd'],
    });

    expect(issues).toEqual([]);
  });

  it('does not surface pre-existing hidden issues when they are unchanged', () => {
    const originalProject = {
      phaseId: phaseResolver.designPhase,
      programmed: true,
      planningStartYear: 2026,
      constructionEndYear: 2027,
      estPlanningStart: '01.01.2026',
      estPlanningEnd: '31.12.2026',
      presenceStart: '01.02.2026',
      presenceEnd: '30.11.2026',
      visibilityStart: '01.03.2026',
      visibilityEnd: '31.10.2026',
      estConstructionStart: '01.04.2027',
      estConstructionEnd: '31.10.2027',
      categoryId: '',
      priorityId: '',
    };

    const issues = getNewProjectValidationIssues({
      originalProject,
      nextProject: {
        ...originalProject,
        estPlanningStart: '02.01.2026',
      },
      phaseResolver,
      visibleFields: [
        'phase',
        'estPlanningStart',
        'estPlanningEnd',
        'presenceStart',
        'presenceEnd',
        'visibilityStart',
        'visibilityEnd',
      ],
    });

    expect(issues).toEqual([]);
  });
});
