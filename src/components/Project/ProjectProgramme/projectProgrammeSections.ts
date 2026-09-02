import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';

export type ProjectProgrammeSectionId =
  | 'basicInfo'
  | 'designCriteria'
  | 'trafficPlanningCriteria'
  | 'urbanSpacingPlanningCriteria';

export interface IProjectProgrammeSectionConfig {
  id: ProjectProgrammeSectionId;
  label: string;
  cardText: string;
  actionText: string;
  showInBrief: boolean;
  sectionIsStarted: boolean;
}

// Fields only editable/required in the extended (non-brief) basic info form
const EXTENDED_ONLY_BASIC_INFO_FIELDS: (keyof IProjectProgrammeBasicInfo)[] = [
  'strategyGoals',
  'costClass',
  'projectSize',
  'risks',
  'studyAndPlanningNeeds',
  'planningAndImplementationFeasibility',
  'specialConsiderations',
  'otherConsiderations',
];

export function hasExtendedBasicInfoContent(
  basicInfo?: IProjectProgrammeBasicInfo | null,
): boolean {
  return EXTENDED_ONLY_BASIC_INFO_FIELDS.some((field) => {
    const value = basicInfo?.[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

const SECTION_METADATA_FIELDS = new Set([
  'id',
  'projectProgramme',
  'project_programme',
  'createdDate',
  'updatedDate',
  'createdBy',
  'updatedBy',
  'contentType',
  'objectId',
]);

export function isSectionStarted(value: unknown): boolean {
  const valuesToCheck: unknown[] = [value];

  while (valuesToCheck.length > 0) {
    const currentValue = valuesToCheck.pop();

    if (currentValue === null || currentValue === undefined || currentValue === false) {
      continue;
    }

    if (typeof currentValue === 'string') {
      if (currentValue.trim().length > 0) {
        return true;
      }
      continue;
    }

    if (Array.isArray(currentValue)) {
      valuesToCheck.push(...currentValue);
      continue;
    }

    if (typeof currentValue === 'object') {
      Object.entries(currentValue).forEach(([field, fieldValue]) => {
        if (!SECTION_METADATA_FIELDS.has(field)) {
          valuesToCheck.push(fieldValue);
        }
      });
      continue;
    }

    return true;
  }

  return false;
}

const SECTION_ID_TO_API_ROUTE: Record<ProjectProgrammeSectionId, string> = {
  basicInfo: 'basic-info',
  designCriteria: 'design-criteria',
  trafficPlanningCriteria: 'traffic-planning-criteria',
  urbanSpacingPlanningCriteria: 'urban-spacing-planning-criteria',
};

export function mapSectionIdToApiRoute(sectionId: ProjectProgrammeSectionId): string {
  return SECTION_ID_TO_API_ROUTE[sectionId];
}
