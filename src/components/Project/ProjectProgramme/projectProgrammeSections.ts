import { IProjectProgrammeBasicInfo } from '@/interfaces/projectProgrammeInterfaces';
import { TFunction } from 'i18next';

export type ProjectProgrammeSectionId =
  | 'basicInfo'
  | 'designCriteria'
  | 'trafficPlanningCriteria'
  | 'urbanSpacingPlanningCriteria'
  | 'maintenanceNeeds';

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
  maintenanceNeeds: 'maintenance-needs',
};

export function mapSectionIdToApiRoute(sectionId: ProjectProgrammeSectionId): string {
  return SECTION_ID_TO_API_ROUTE[sectionId];
}

export const getProjectProgrammeSections = (
  t: TFunction,
  briefProgramme: boolean,
  hasBasicInfo: boolean,
  hasDesignCriteria: boolean,
  hasTrafficPlanningCriteria: boolean,
  hasUrbanSpacingPlanningCriteria: boolean,
  hasMaintenanceNeeds: boolean,
): IProjectProgrammeSectionConfig[] => [
  {
    id: 'basicInfo',
    label: t('projectProgrammeForm.basicInfoCardTitle'),
    cardText: `${t('projectProgrammeForm.basicInfoCardText')} ${
      !briefProgramme ? t('projectProgrammeForm.basicInfoCardTextExtensionForExtended') : ''
    }`,
    actionText: t('projectProgrammeForm.fillBasicInfo'),
    showInBrief: true,
    sectionIsStarted: hasBasicInfo,
  },
  {
    id: 'designCriteria',
    label: t('projectProgrammeForm.designCriteriaCardTitle'),
    cardText: t('projectProgrammeForm.designCriteriaCardText'),
    actionText: t('projectProgrammeForm.fillDesignCriteria'),
    showInBrief: false,
    sectionIsStarted: hasDesignCriteria,
  },
  {
    id: 'trafficPlanningCriteria',
    label: t('projectProgrammeForm.trafficPlanningCriteriaCardTitle'),
    cardText: t('projectProgrammeForm.trafficPlanningCriteriaCardText'),
    actionText: t('projectProgrammeForm.fillTrafficPlanningCriteria'),
    showInBrief: false,
    sectionIsStarted: hasTrafficPlanningCriteria,
  },
  {
    id: 'urbanSpacingPlanningCriteria',
    label: t('projectProgrammeForm.urbanSpacingPlanningCriteriaCardTitle'),
    cardText: t('projectProgrammeForm.urbanSpacingPlanningCriteriaCardText'),
    actionText: t('projectProgrammeForm.fillUrbanSpacingPlanningCriteria'),
    showInBrief: false,
    sectionIsStarted: hasUrbanSpacingPlanningCriteria,
  },
  {
    id: 'maintenanceNeeds',
    label: t('projectProgrammeForm.maintenanceNeedsCardTitle'),
    cardText: t('projectProgrammeForm.maintenanceNeedsCardText'),
    actionText: t('projectProgrammeForm.fillMaintenanceNeeds'),
    showInBrief: false,
    sectionIsStarted: hasMaintenanceNeeds,
  },
];
