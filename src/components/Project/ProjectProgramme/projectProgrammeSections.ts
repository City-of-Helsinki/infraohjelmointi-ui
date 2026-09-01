import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';

export type ProjectProgrammeSectionId = 'basicInfo' | 'designCriteria';

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
  return EXTENDED_ONLY_BASIC_INFO_FIELDS.some((field) => Boolean(basicInfo?.[field]));
}

// Sections whose record already carries meaningful data as soon as it's created
// (e.g. basicInfo is pre-filled from the project), so mere existence means "started".
// Any section NOT listed here is only "started" once one of its own fields (or a
// link) actually has a value - opening/auto-creating an empty section doesn't count.
const EXISTENCE_BASED_SECTIONS = new Set<ProjectProgrammeSectionId>(['basicInfo']);

// Fields returned by the API on every section that aren't user-entered content.
const NON_CONTENT_FIELDS = new Set([
  'id',
  'project_programme',
  'createdDate',
  'updatedDate',
  'createdBy',
  'updatedBy',
]);

// Add a new section id to EXISTENCE_BASED_SECTIONS above only if its record is
// pre-populated with real data on creation; otherwise this works out of the box.
export function isSectionStarted(
  sectionId: ProjectProgrammeSectionId,
  sectionData?: object | null,
): boolean {
  if (!sectionData) {
    return false;
  }

  if (EXISTENCE_BASED_SECTIONS.has(sectionId)) {
    return true;
  }

  return Object.entries(sectionData as Record<string, unknown>).some(([field, value]) => {
    if (NON_CONTENT_FIELDS.has(field)) {
      return false;
    }

    if (field === 'links') {
      return Array.isArray(value) && value.length > 0;
    }

    return Boolean(value);
  });
}

const SECTION_ID_TO_API_ROUTE: Record<ProjectProgrammeSectionId, string> = {
  basicInfo: 'basic-info',
  designCriteria: 'design-criteria',
};

export function mapSectionIdToApiRoute(sectionId: ProjectProgrammeSectionId): string {
  return SECTION_ID_TO_API_ROUTE[sectionId];
}
