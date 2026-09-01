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

const SECTION_ID_TO_API_ROUTE: Record<ProjectProgrammeSectionId, string> = {
  basicInfo: 'basic-info',
  designCriteria: 'design-criteria',
};

export function mapSectionIdToApiRoute(sectionId: ProjectProgrammeSectionId): string {
  return SECTION_ID_TO_API_ROUTE[sectionId];
}
