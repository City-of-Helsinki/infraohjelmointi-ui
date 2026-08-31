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

// export const PROJECT_PROGRAMME_SECTIONS: IProjectProgrammeSectionConfig[] = [
//   {
//     id: 'basicInfo',
//     labelKey: 'projectProgrammeForm.basicInfoCardTitle',
//     textKey: 'projectProgrammeForm.basicInfoCardText',
//     actionKey: 'projectProgrammeForm.fillBasicInfo',
//     showInBrief: true,
//   },
//   {
//     id: 'designCriteria',
//     labelKey: 'projectProgrammeForm.designCriteriaCardTitle',
//     textKey: 'projectProgrammeForm.designCriteriaCardText',
//     actionKey: 'projectProgrammeForm.fillDesignCriteria',
//     showInBrief: true,
//   },
// ];

const SECTION_ID_TO_API_ROUTE: Record<ProjectProgrammeSectionId, string> = {
  basicInfo: 'basic-info',
  designCriteria: 'design-criteria',
};

export function mapSectionIdToApiRoute(sectionId: ProjectProgrammeSectionId): string {
  return SECTION_ID_TO_API_ROUTE[sectionId];
}

export type ProjectProgrammeFormSectionConfig = {
  fields: readonly string[];
  toApiField: Record<string, string>;
};

export const PROJECT_PROGRAMME_FORM_SECTION_CONFIG: Record<
  ProjectProgrammeSectionId,
  ProjectProgrammeFormSectionConfig
> = {
  basicInfo: {
    fields: [
      'projectName',
      'district',
      'projectProgrammeCompiler',
      'personsInvolved',
      'estimatedCosts',
      'inspector',
      'summary',
      'strategyGoals',
      'costClass',
      'projectSize',
      'risks',
      'studyAndPlanningNeeds',
      'planningAndImplementationFeasibility',
      'specialConsiderations',
      'otherConsiderations',
    ],
    toApiField: {
      projectName: 'projectName',
      district: 'district',
      projectProgrammeCompiler: 'projectProgrammeCompiler',
      personsInvolved: 'personsInvolved',
      estimatedCosts: 'estimatedCosts',
      inspector: 'inspector',
      summary: 'summary',
      strategyGoals: 'strategyGoals',
      costClass: 'costClass',
      projectSize: 'projectSize',
      risks: 'risks',
      studyAndPlanningNeeds: 'studyAndPlanningNeeds',
      planningAndImplementationFeasibility: 'planningAndImplementationFeasibility',
      specialConsiderations: 'specialConsiderations',
      otherConsiderations: 'otherConsiderations',
    },
  },

  designCriteria: {
    fields: [
      'guidingZoningRegulations',
      'siteValuesProtectionAndSignificance',
      'relationshipToPublicAreaServices',
    ],
    toApiField: {
      guidingZoningRegulations: 'guidingZoningRegulations',
      siteValuesProtectionAndSignificance: 'siteValuesProtectionAndSignificance',
      relationshipToPublicAreaServices: 'relationshipToPublicAreaServices',
    },
  },
};
