import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type {
  IProjectProgrammeBasicInfo,
  IProjectProgrammeForm,
  IProjectProgrammeLinkFormItem,
  IProjectProgrammeDesignCriteria,
  IProjectProgrammeMaintenanceNeeds,
} from '@/interfaces/projectProgrammeInterfaces';

function getDistrictValue(district: IProjectProgrammeBasicInfo['district']): string {
  if (!district) {
    return '';
  }

  if (typeof district === 'string') {
    return district;
  }

  return district.name ?? '';
}

function getTextValue(value?: string | null): string {
  return value ?? '';
}

function hasItems<T>(items?: T[] | null): items is T[] {
  return (items?.length ?? 0) > 0;
}

function getLinksValue(
  links?: IProjectProgrammeBasicInfo['links'] | IProjectProgrammeDesignCriteria['links'],
): IProjectProgrammeLinkFormItem[] {
  if (!hasItems(links)) {
    return [{ value: '' }];
  }

  const normalizedLinks = links
    .map((link) => {
      if (typeof link === 'string') {
        return { value: getTextValue(link) };
      }

      return { value: getTextValue(link?.value) };
    })
    .filter((link) => link.value !== '');

  if (hasItems(normalizedLinks)) {
    return normalizedLinks;
  }

  return [{ value: '' }];
}

function getBasicInfoValues(basicInfo?: IProjectProgrammeBasicInfo): IProjectProgrammeBasicInfo {
  return {
    projectName: getTextValue(basicInfo?.projectName),
    district: getDistrictValue(basicInfo?.district),
    projectProgrammeCompiler: getTextValue(basicInfo?.projectProgrammeCompiler),
    personsInvolved: getTextValue(basicInfo?.personsInvolved),
    estimatedCosts: getTextValue(basicInfo?.estimatedCosts),
    inspector: getTextValue(basicInfo?.inspector),
    summary: getTextValue(basicInfo?.summary),
    strategyGoals: getTextValue(basicInfo?.strategyGoals),
    costClass: getTextValue(basicInfo?.costClass),
    projectSize: getTextValue(basicInfo?.projectSize),
    risks: getTextValue(basicInfo?.risks),
    studyAndPlanningNeeds: getTextValue(basicInfo?.studyAndPlanningNeeds),
    planningAndImplementationFeasibility: getTextValue(
      basicInfo?.planningAndImplementationFeasibility,
    ),
    specialConsiderations: getTextValue(basicInfo?.specialConsiderations),
    otherConsiderations: getTextValue(basicInfo?.otherConsiderations),
    links: getLinksValue(basicInfo?.links),
  };
}

function getDesignCriteriaValues(
  designCriteria?: IProjectProgrammeDesignCriteria,
): IProjectProgrammeDesignCriteria {
  return {
    guidingZoningRegulations: getTextValue(designCriteria?.guidingZoningRegulations),
    siteValuesProtectionAndSignificance: getTextValue(
      designCriteria?.siteValuesProtectionAndSignificance,
    ),
    relationshipToPublicAreaServices: getTextValue(
      designCriteria?.relationshipToPublicAreaServices,
    ),
    links: getLinksValue(designCriteria?.links),
  };
}

function getMaintenanceNeedsValues(
  maintenanceNeeds?: IProjectProgrammeMaintenanceNeeds,
): IProjectProgrammeMaintenanceNeeds {
  return {
    maintenanceNeeds: getTextValue(maintenanceNeeds?.maintenanceNeeds),
    links: getLinksValue(maintenanceNeeds?.links),
  };
}

// Every section has to be listed here, reset() replaces the whole form value object.
function getFormValues(formData?: IProjectProgrammeForm): IProjectProgrammeForm {
  return {
    basicInfo: getBasicInfoValues(formData?.basicInfo),
    designCriteria: getDesignCriteriaValues(formData?.designCriteria),
    maintenanceNeeds: getMaintenanceNeedsValues(formData?.maintenanceNeeds),
  };
}

export default function useProjectProgrammeForm(formData?: IProjectProgrammeForm) {
  const formMethods = useForm<IProjectProgrammeForm>({
    defaultValues: getFormValues(),
    mode: 'onBlur',
  });

  const { reset } = formMethods;

  useEffect(() => {
    reset(getFormValues(formData));
  }, [formData, reset]);

  return formMethods;
}
