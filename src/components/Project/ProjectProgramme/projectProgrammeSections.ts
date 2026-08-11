export type ProjectProgrammeSectionId = 'basicInfo';

export interface IProjectProgrammeSectionConfig {
  id: ProjectProgrammeSectionId;
  labelKey: string;
  textKey: string;
  actionKey: string;
  showInBrief: boolean;
}

export const PROJECT_PROGRAMME_SECTIONS: IProjectProgrammeSectionConfig[] = [
  {
    id: 'basicInfo',
    labelKey: 'projectProgrammeForm.basicInfoCardTitle',
    textKey: 'projectProgrammeForm.basicInfoCardText',
    actionKey: 'projectProgrammeForm.fillBasicInfo',
    showInBrief: true,
  },
];

const SECTION_ID_TO_API_ROUTE: Record<ProjectProgrammeSectionId, string> = {
  basicInfo: 'basic-info',
};

export function mapSectionIdToApiRoute(sectionId: ProjectProgrammeSectionId): string {
  return SECTION_ID_TO_API_ROUTE[sectionId];
}
